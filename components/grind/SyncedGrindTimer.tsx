"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import GrindPresence from "@/components/grind/GrindPresence";
import { createClient } from "@/lib/supabase/client";
import TextMorph from "@/components/page";

type GroupSession = { id: string; name: string; created_by: string; session_mode: "countdown" | "stopwatch" | null; session_duration: number | null; session_state: "idle" | "running" | "paused" | "completed" | null; session_started_at: string | null; session_elapsed_seconds: number | null };

const formatTime = (value: number) => [Math.floor(value / 3600), Math.floor((value % 3600) / 60), value % 60].map((unit) => String(unit).padStart(2, "0")).join(":");

export default function SyncedGrindTimer({ groupId }: { groupId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [group, setGroup] = useState<GroupSession | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [error, setError] = useState("");
  const loadGroup = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace(`/login?next=${encodeURIComponent(`/timer?group=${groupId}`)}`); return; }
    setUserId(user.id);
    const { data: membership } = await supabase.from("grind_group_members").select("group_id").eq("group_id", groupId).eq("user_id", user.id).maybeSingle();
    if (!membership) { router.replace(`/grind/${groupId}`); return; }
    const { data, error: groupError } = await supabase.from("grind_groups").select("id, name, created_by, session_mode, session_duration, session_state, session_started_at, session_elapsed_seconds").eq("id", groupId).single<GroupSession>();
    if (groupError || !data) { setError(groupError?.message ?? "This grind is no longer available."); return; }
    setGroup(data);
  }, [groupId, router, supabase]);
  useEffect(() => {
    void Promise.resolve().then(loadGroup);
    const channel = supabase.channel(`grind-clock:${groupId}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "grind_groups", filter: `id=eq.${groupId}` }, () => void loadGroup()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [groupId, loadGroup, supabase]);
  useEffect(() => {
    if (group?.session_state !== "running") return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [group?.session_state]);
  const elapsed = group ? Math.max(0, (group.session_elapsed_seconds ?? 0) + (group.session_state === "running" && group.session_started_at ? Math.floor((now - new Date(group.session_started_at).getTime()) / 1000) : 0)) : 0;
  const isCountdown = group?.session_mode === "countdown";
  const shownSeconds = isCountdown ? Math.max(0, (group?.session_duration ?? 0) - elapsed) : elapsed;
  const isHost = group?.created_by === userId;
  const updateClock = useCallback(async (nextState: "running" | "paused" | "completed") => {
    if (!group || !isHost) return;
    const updates = nextState === "running" ? { session_state: "running", session_started_at: new Date().toISOString() } : { session_state: nextState, session_started_at: null, session_elapsed_seconds: elapsed };
    const { error: updateError } = await supabase.from("grind_groups").update(updates).eq("id", group.id);
    if (updateError) setError(updateError.message);
  }, [elapsed, group, isHost, supabase]);
  useEffect(() => { if (isHost && isCountdown && group?.session_state === "running" && shownSeconds === 0) void Promise.resolve().then(() => updateClock("completed")); }, [group?.session_state, isCountdown, isHost, shownSeconds, updateClock]);
  useEffect(() => { if (group?.session_state === "completed") router.replace(`/grind/${groupId}`); }, [group?.session_state, groupId, router]);
  const digitStyle = { fontFamily: "Inter", fontSize: "clamp(4rem, 16vw, 10rem)", fontWeight: 500, lineHeight: 1 };
  const clock = formatTime(shownSeconds);
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#20201c] px-5 text-[#f9f7f0]"><GrindPresence groupId={groupId} /><button onClick={() => router.push(`/grind/${groupId}`)} className="absolute right-5 top-5 rounded-full border border-[#d8ff3f]/30 px-4 py-2 text-xs text-[#f9f7f0]/75 hover:bg-white/[0.06]">Back to room</button><motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl text-center"><p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d8ff3f]/60">{group?.name ?? "Grind"}</p><p className="mt-3 text-sm text-[#f4f1ea]/45">{isHost ? "You are hosting this shared clock." : "The host controls this shared clock."}</p>{error ? <p className="mt-8 text-sm text-red-300">{error}</p> : <div className="mt-7 flex justify-center gap-2 text-[#d8ff3f]">{clock.split("").map((character, index) => character === ":" ? <span key={`colon-${index}`} className="text-[clamp(4rem,16vw,10rem)] leading-none text-[#f9f7f0]">:</span> : <TextMorph key={index} words={character} color="#d8ff3f" font={digitStyle} transition={{ duration: 0.4, ease: "easeOut" }} />)}</div>}<p className="mt-5 text-xs uppercase tracking-[0.18em] text-[#f4f1ea]/35">{group?.session_state === "paused" ? "Paused" : isCountdown ? "Countdown" : "Stopwatch"}</p>{isHost && group && <div className="mt-9 flex justify-center gap-3"><button onClick={() => void updateClock(group.session_state === "running" ? "paused" : "running")} className="rounded-full border border-[#d8ff3f]/40 px-6 py-3 text-sm hover:bg-[#33332d]">{group.session_state === "running" ? "Pause for everyone" : "Resume for everyone"}</button><button onClick={() => void updateClock("completed")} className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/75 hover:bg-white/[0.06]">Finish grind</button></div>}</motion.section></main>;
}
