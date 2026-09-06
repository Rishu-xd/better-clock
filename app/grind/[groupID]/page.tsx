
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { AnimatePresence, motion } from "motion/react";

import { createClient } from "@/lib/supabase/client";

type Group = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  invite_code: string;
  session_state?: "idle" | "running" | "paused" | "completed";
};

type Member = {
  user_id: string;
  joined_at: string;
};

export default function GrindRoomPage() {
  const params = useParams<{ groupID: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const groupID = params.groupID;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [timerMode, setTimerMode] = useState<"countdown" | "stopwatch">("countdown");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [starting, setStarting] = useState(false);

  const loadRoom = useCallback(async () => {
    setError("");

    try {
      if (!groupID) {
        throw new Error("Invalid grind room ID.");
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      // Get group
      const { data: groupData, error: groupError } = await supabase
        .from("grind_groups")
        .select("*")
        .eq("id", groupID)
        .single();

      if (groupError) {
        throw new Error(groupError.message);
      }

      // Get members
      const { data: memberData, error: memberError } = await supabase
        .from("grind_group_members")
        .select("user_id, joined_at")
        .eq("group_id", groupID)
        .order("joined_at", { ascending: true });

      if (memberError) {
        throw new Error(memberError.message);
      }

      setGroup(groupData);
      setMembers(memberData ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this grind."
      );
    } finally {
      setLoading(false);
    }
  }, [groupID, router, supabase]);

  useEffect(() => {
    void Promise.resolve().then(loadRoom);
  }, [loadRoom]);

  useEffect(() => {
    if (group?.session_state === "running") {
      router.replace(`/timer?group=${encodeURIComponent(group.id)}`);
    }
  }, [group, router]);

  useEffect(() => {
    if (!groupID) return;

    const channel = supabase
      .channel(`grind-members:${groupID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grind_group_members",
          filter: `group_id=eq.${groupID}`,
        },
        () => {
          loadRoom();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupID, loadRoom, supabase]);

  useEffect(() => {
    if (!groupID) return;
    const channel = supabase
      .channel(`grind-room:${groupID}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "grind_groups", filter: `id=eq.${groupID}` }, () => void loadRoom())
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [groupID, loadRoom, supabase]);

  // Close invite modal with Escape
  useEffect(() => {
    if (!inviteOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInviteOpen(false);
        setCopied(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inviteOpen]);

  const inviteUrl =
    typeof window !== "undefined" && group?.invite_code
      ? `${window.location.origin}/grind/join/${group.invite_code}`
      : "";

  const handleCopyLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error("Unable to copy invite link:", err);
    }
  };

  const handleShare = async () => {
    if (!inviteUrl || sharing) return;

    setSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my grind on Better Clock",
          text: `Come grind with me on Better Clock.`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 1800);
      }
    } catch (err) {
      // User closing the native share sheet is not an error
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Unable to share invite:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUserId || !groupID) return;

    setLeaving(true);

    try {
      const { error: leaveError } = await supabase
        .from("grind_group_members")
        .delete()
        .eq("group_id", groupID)
        .eq("user_id", currentUserId);

      if (leaveError) {
        throw new Error(leaveError.message);
      }

      // If creator leaves and nobody else is inside,
      // remove the temporary room.
      if (
        group?.created_by === currentUserId &&
        members.length <= 1
      ) {
        const { error: deleteGroupError } = await supabase
          .from("grind_groups")
          .delete()
          .eq("id", groupID);

        if (deleteGroupError) {
          throw new Error(deleteGroupError.message);
        }
      }

      router.push("/grind");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to leave the grind."
      );

      setLeaving(false);
    }
  };

  const handleStartGrind = async () => {
    if (!group || currentUserId !== group.created_by) return;
    setStarting(true);
    setError("");
    const { error: startError } = await supabase.from("grind_groups").update({
      session_mode: timerMode,
      session_duration: timerMode === "countdown" ? durationMinutes * 60 : 0,
      session_state: "running",
      session_started_at: new Date().toISOString(),
      session_elapsed_seconds: 0,
    }).eq("id", group.id);
    if (startError) { setError(startError.message); setStarting(false); return; }
    router.push(`/timer?group=${encodeURIComponent(group.id)}`);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            rounded-3xl
            border border-black/[0.07]
            bg-white/55
            px-6 py-4
            text-sm
            text-black/45
            shadow-[0_20px_70px_rgba(0,0,0,0.06)]
            backdrop-blur-2xl
            dark:border-white/[0.09]
            dark:bg-white/[0.07]
            dark:text-white/45
          "
        >
          Loading grind...
        </motion.div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            w-full max-w-md
            rounded-3xl
            border border-black/[0.07]
            bg-white/55
            p-6
            text-center
            shadow-[0_20px_70px_rgba(0,0,0,0.06)]
            backdrop-blur-2xl
            dark:border-white/[0.09]
            dark:bg-white/[0.07]
          "
        >
          <p className="text-sm text-red-500/80 dark:text-red-300/80">
            {error || "This grind doesn't exist."}
          </p>

          <button
            onClick={() => router.push("/grind")}
            className="
              mt-5
              rounded-xl
              bg-black/[0.88]
              px-5 py-2.5
              text-sm
              font-medium
              text-white
              transition-opacity
              hover:opacity-80
              dark:bg-white/[0.9]
              dark:text-black
            "
          >
            Back
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
        {/* Background atmosphere */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[-180px]
            h-[420px]
            w-[420px]
            -translate-x-1/2
            rounded-full
            bg-orange-300/[0.08]
            blur-[100px]
            dark:bg-orange-300/[0.05]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-[-160px]
            right-[-100px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-blue-300/[0.06]
            blur-[100px]
            dark:bg-blue-300/[0.035]
          "
        />

        <div className="relative mx-auto w-full max-w-3xl">
          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
            className="mb-6"
          >
            <button
              onClick={() => router.push("/grind")}
              className="
                mb-6
                text-xs
                font-medium
                text-black/35
                transition-colors
                hover:text-black/65
                dark:text-white/35
                dark:hover:text-white/65
              "
            >
              ← Grind Together
            </button>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="
                    mb-2
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-black/35
                    dark:text-white/35
                  "
                >
                  Active room
                </p>

                <h1
                  className="
                    text-3xl
                    font-semibold
                    tracking-tight
                    text-black/85
                    dark:text-white/90
                    sm:text-4xl
                  "
                >
                  {group.name}
                </h1>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-black/[0.06]
                  bg-white/45
                  px-3
                  py-1.5
                  text-xs
                  text-black/45
                  backdrop-blur-xl
                  dark:border-white/[0.08]
                  dark:bg-white/[0.06]
                  dark:text-white/45
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-emerald-500/70
                    shadow-[0_0_10px_rgba(34,197,94,0.35)]
                  "
                />

                {members.length}{" "}
                {members.length === 1 ? "person" : "people"}
              </div>
            </div>
          </motion.div>

          {/* Main glass panel */}

          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 28,
              delay: 0.05,
            }}
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border border-black/[0.07]
              bg-white/50
              p-5
              shadow-[0_24px_80px_rgba(0,0,0,0.07)]
              backdrop-blur-2xl
              sm:p-7
              dark:border-white/[0.09]
              dark:bg-white/[0.065]
              dark:shadow-[0_24px_80px_rgba(0,0,0,0.2)]
            "
          >
            {/* Top glass line */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-white/80
                to-transparent
                dark:via-white/20
              "
            />

            {group.created_by === currentUserId ? <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white/30 p-4 dark:border-white/[0.08] dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-black/65 dark:text-white/75">Session setup</p>
                <p className="mt-0.5 text-xs text-black/35 dark:text-white/35">Choose how this grind begins for you.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-black/[0.06] bg-white/35 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  {(["countdown", "stopwatch"] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => setTimerMode(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${timerMode === mode ? "bg-black/[0.85] text-white dark:bg-white/[0.9] dark:text-black" : "text-black/45 dark:text-white/45"}`}>
                      {mode === "countdown" ? "Timer" : "Stopwatch"}
                    </button>
                  ))}
                </div>
                {timerMode === "countdown" && (
                  <label className="flex items-center gap-1.5 text-xs text-black/45 dark:text-white/45">
                    <input type="number" min="1" max="720" value={durationMinutes} onChange={(event) => setDurationMinutes(Math.max(1, Math.min(720, Number(event.target.value) || 1)))} className="w-14 rounded-lg border border-black/[0.08] bg-white/45 px-2 py-1.5 text-center text-black/70 outline-none dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/75" />
                    min
                  </label>
                )}
              </div>
            </div> : <p className="mb-6 rounded-2xl border border-black/[0.06] bg-white/30 px-4 py-3 text-sm text-black/45 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/45">Waiting for the host to start the shared clock.</p>}

            {/* Room status */}

            <div
              className="
                mb-7
                flex
                items-center
                justify-between
                gap-4
                rounded-2xl
                border border-black/[0.05]
                bg-black/[0.025]
                px-4
                py-3
                dark:border-white/[0.06]
                dark:bg-white/[0.025]
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    font-medium
                    text-black/70
                    dark:text-white/70
                  "
                >
                  Ready to grind?
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-black/35
                    dark:text-white/35
                  "
                >
                  Start when everyone is ready.
                </p>
              </div>

              <div
                className="
                  rounded-full
                  bg-emerald-500/10
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-emerald-600/80
                  dark:text-emerald-300/75
                "
              >
                Waiting
              </div>
            </div>

            {/* Members */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-[0.16em]
                      text-black/35
                      dark:text-white/35
                    "
                  >
                    Members
                  </p>

                  <span
                    className="
                      text-xs
                      tabular-nums
                      text-black/25
                      dark:text-white/25
                    "
                  >
                    {members.length}/20
                  </span>
                </div>

                {/* Invite Friend */}

                {group.created_by === currentUserId && <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setCopied(false);
                    setInviteOpen(true);
                  }}
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-black/[0.06]
                    bg-white/45
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-black/50
                    backdrop-blur-xl
                    transition-colors
                    hover:bg-white/70
                    hover:text-black/70
                    dark:border-white/[0.08]
                    dark:bg-white/[0.05]
                    dark:text-white/50
                    dark:hover:bg-white/[0.09]
                    dark:hover:text-white/75
                  "
                >
                  <span className="text-sm leading-none">+</span>
                  Invite Friend
                </motion.button>}
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {members.map((member, index) => {
                    const isYou =
                      member.user_id === currentUserId;

                    return (
                      <motion.div
                        key={member.user_id}
                        layout
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                          scale: 0.98,
                        }}
                        transition={{
                          delay: index * 0.035,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="
                          group
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          border border-black/[0.05]
                          bg-white/35
                          px-4
                          py-3
                          transition-colors
                          hover:bg-white/55
                          dark:border-white/[0.06]
                          dark:bg-white/[0.035]
                          dark:hover:bg-white/[0.06]
                        "
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}

                          <div
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-black/[0.06]
                              bg-black/[0.035]
                              text-xs
                              font-medium
                              text-black/50
                              dark:border-white/[0.08]
                              dark:bg-white/[0.06]
                              dark:text-white/50
                            "
                          >
                            {isYou ? "Y" : "G"}
                          </div>

                          <div>
                            <p
                              className="
                                text-sm
                                font-medium
                                text-black/70
                                dark:text-white/75
                              "
                            >
                              {isYou ? "You" : "Grinder"}
                            </p>

                            <p
                              className="
                                text-xs
                                text-black/30
                                dark:text-white/30
                              "
                            >
                              Ready
                            </p>
                          </div>
                        </div>

                        {/* Status */}

                        <div className="flex items-center gap-2">
                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-black/20
                              dark:bg-white/20
                            "
                          />

                          <span
                            className="
                              text-xs
                              text-black/35
                              dark:text-white/35
                            "
                          >
                            Waiting
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Divider */}

            <div
              className="
                my-7
                h-px
                bg-black/[0.06]
                dark:bg-white/[0.07]
              "
            />

            {/* Actions */}

            <div className="flex flex-col gap-2 sm:flex-row">
              {group.created_by === currentUserId ? <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => void handleStartGrind()}
                disabled={starting}
                className="
                  h-12
                  flex-1
                  rounded-2xl
                  bg-black/[0.88]
                  text-sm
                  font-medium
                  text-white
                  shadow-lg
                  shadow-black/10
                  transition-opacity
                  hover:opacity-90
                  dark:bg-white/[0.9]
                  dark:text-black
                "
              >
                {starting ? "Starting..." : `Start ${timerMode === "countdown" ? "Timer" : "Stopwatch"}`}
              </motion.button>
              : <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} onClick={() => router.push("/Dashboard")} className="h-12 flex-1 rounded-2xl border border-black/[0.07] bg-white/35 text-sm font-medium text-black/55 backdrop-blur-xl transition-colors hover:bg-white/60 dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white/55 dark:hover:bg-white/[0.07]">Open Dashboard</motion.button>}

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleLeave}
                disabled={leaving}
                className="
                  h-12
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-white/35
                  px-6
                  text-sm
                  font-medium
                  text-black/55
                  backdrop-blur-xl
                  transition-colors
                  hover:bg-white/60
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-white/[0.09]
                  dark:bg-white/[0.04]
                  dark:text-white/55
                  dark:hover:bg-white/[0.07]
                "
              >
                {leaving ? "Leaving..." : "Leave"}
              </motion.button>
            </div>
          </motion.section>

          {/* Small footer */}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="
              mt-5
              text-center
              text-[11px]
              text-black/25
              dark:text-white/25
            "
          >
            Focus together. Finish together.
          </motion.p>
        </div>
      </main>

      {/* =========================================================
          INVITE MODAL
         ========================================================= */}

      <AnimatePresence>
        {inviteOpen && (
          <motion.div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              px-4
              py-6
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}

            <motion.button
              type="button"
              aria-label="Close invite dialog"
              onClick={() => {
                setInviteOpen(false);
                setCopied(false);
              }}
              className="
                absolute
                inset-0
                cursor-default
                bg-black/10
                backdrop-blur-md
                dark:bg-black/30
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-title"
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 12,
                scale: 0.97,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
              className="
                relative
                w-full
                max-w-md
                overflow-hidden
                rounded-[2rem]
                border border-black/[0.08]
                bg-white/75
                p-6
                shadow-[0_30px_100px_rgba(0,0,0,0.16)]
                backdrop-blur-3xl
                dark:border-white/[0.1]
                dark:bg-[#171717]/80
                dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)]
                sm:p-7
              "
            >
              {/* Glass highlight */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white
                  to-transparent
                  dark:via-white/30
                "
              />

              {/* Close button */}

              <button
                type="button"
                onClick={() => {
                  setInviteOpen(false);
                  setCopied(false);
                }}
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-lg
                  text-black/30
                  transition-colors
                  hover:bg-black/[0.05]
                  hover:text-black/60
                  dark:text-white/30
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-white/70
                "
                aria-label="Close"
              >
                ×
              </button>

              {/* Header */}

              <div className="pr-8">
                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-black/[0.06]
                    bg-white/55
                    text-lg
                    shadow-sm
                    dark:border-white/[0.08]
                    dark:bg-white/[0.06]
                  "
                >
                  ↗
                </div>

                <h2
                  id="invite-title"
                  className="
                    text-xl
                    font-semibold
                    tracking-tight
                    text-black/85
                    dark:text-white/90
                  "
                >
                  Invite a friend
                </h2>

                <p
                  className="
                    mt-1.5
                    text-sm
                    leading-6
                    text-black/40
                    dark:text-white/40
                  "
                >
                  Send this link to someone you want to
                  grind with.
                </p>
              </div>

              {/* Link */}

              <div className="mt-6">
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-black/[0.06]
                    bg-black/[0.025]
                    p-2
                    dark:border-white/[0.07]
                    dark:bg-white/[0.035]
                  "
                >
                  <div
                    className="
                      min-w-0
                      flex-1
                      truncate
                      px-2
                      text-xs
                      text-black/40
                      dark:text-white/40
                    "
                  >
                    {inviteUrl}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopyLink}
                    className="
                      shrink-0
                      rounded-xl
                      bg-black/[0.88]
                      px-3.5
                      py-2.5
                      text-xs
                      font-medium
                      text-white
                      transition-opacity
                      hover:opacity-90
                      dark:bg-white/[0.9]
                      dark:text-black
                    "
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{
                            opacity: 0,
                            y: 4,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -4,
                          }}
                        >
                          Copied!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{
                            opacity: 0,
                            y: 4,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -4,
                          }}
                        >
                          Copy Link
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Share */}

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleShare}
                disabled={sharing}
                className="
                  mt-3
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-white/45
                  text-sm
                  font-medium
                  text-black/65
                  backdrop-blur-xl
                  transition-colors
                  hover:bg-white/70
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  dark:border-white/[0.09]
                  dark:bg-white/[0.05]
                  dark:text-white/70
                  dark:hover:bg-white/[0.09]
                "
              >
                <span className="text-base">↗</span>

                {sharing ? "Opening..." : "Share Invite"}
              </motion.button>

              {/* Footer */}

              <p
                className="
                  mt-5
                  text-center
                  text-[11px]
                  text-black/25
                  dark:text-white/25
                "
              >
                Anyone with this link can join the grind.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
