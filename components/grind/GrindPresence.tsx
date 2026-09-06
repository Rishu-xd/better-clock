"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { createClient } from "@/lib/supabase/client";

type GrindPresenceProps = { groupId: string | null };

export default function GrindPresence({ groupId }: GrindPresenceProps) {
  const supabase = useMemo(() => createClient(), []);
  const [count, setCount] = useState<number | null>(null);
  const [joinedNotice, setJoinedNotice] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    let active = true;
    const loadCount = async () => {
      const { count: memberCount } = await supabase
        .from("grind_group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);

      if (active) setCount(memberCount ?? 0);
    };

    void loadCount();

    const channel = supabase
      .channel(`timer-grind-members:${groupId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grind_group_members", filter: `group_id=eq.${groupId}` },
        (payload) => {
          void loadCount();
          if (payload.eventType === "INSERT") {
            setJoinedNotice(true);
            window.setTimeout(() => setJoinedNotice(false), 3200);
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);

  if (!groupId) return null;

  return (
    <>
      <div className="absolute left-5 top-5 rounded-full border border-[#d8ff3f]/25 bg-[#20201c]/75 px-3 py-1.5 text-xs text-[#f9f7f0]/75 backdrop-blur-xl sm:left-6 sm:top-6">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {count === null ? "Loading grinders" : `${count} ${count === 1 ? "grinder" : "grinders"}`}
      </div>

      <AnimatePresence>
        {joinedNotice && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-2xl border border-[#d8ff3f]/30 bg-[#292925]/90 px-4 py-3 text-sm text-[#f9f7f0] shadow-xl backdrop-blur-2xl"
          >
            Someone just joined the grind.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
