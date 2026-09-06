"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";

import { createClient } from "@/lib/supabase/client";

type Group = { id: string; name: string };

export default function JoinGrindPage() {
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("Joining your grind...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function joinGrind() {
      const inviteCode = params.inviteCode?.trim();
      if (!inviteCode) {
        setError("This invite link is invalid.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(`/login?next=${encodeURIComponent(`/grind/join/${inviteCode}`)}`);
        return;
      }

      const { data: group, error: groupError } = await supabase
        .from("grind_groups")
        .select("id, name")
        .eq("invite_code", inviteCode)
        .maybeSingle<Group>();

      if (groupError || !group) {
        if (active) setError("This grind invite has expired or is no longer available.");
        return;
      }

      if (active) setMessage(`Joining ${group.name}...`);

      const { data: existingMembership, error: membershipError } = await supabase
        .from("grind_group_members")
        .select("group_id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError) {
        if (active) setError(membershipError.message);
        return;
      }

      if (!existingMembership) {
        const { error: insertError } = await supabase
          .from("grind_group_members")
          .insert({ group_id: group.id, user_id: user.id });

        // A concurrent repeat visit can hit the unique membership constraint.
        if (insertError && insertError.code !== "23505") {
          if (active) setError(insertError.message);
          return;
        }
      }

      router.replace(`/grind/${group.id}`);
    }

    joinGrind();
    return () => { active = false; };
  }, [params.inviteCode, router, supabase]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171714] px-4 text-[#f9f7f0]">
      <div className="orb orb-one !right-[-11rem] !top-[-8rem] !opacity-70" />
      <motion.section
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
      >
        <p className={error ? "text-sm text-red-300/90" : "text-sm text-white/65"}>{error || message}</p>
        {error && (
          <button onClick={() => router.push("/grind")} className="mt-5 rounded-xl bg-white/[0.9] px-5 py-2.5 text-sm font-medium text-black">
            Back to Grind Together
          </button>
        )}
      </motion.section>
    </main>
  );
}
