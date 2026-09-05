"use client";

import { useRouter } from "next/navigation";
import CreateGrind from "@/components/grind/CreateGrind";

export default function GrindTogetherPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171714] px-4 text-[#f9f7f0]">
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="orb orb-one !right-[-11rem] !top-[-8rem] !opacity-70" />
      <div className="orb orb-two !bottom-[-7rem] !left-[-6rem]" />
      <CreateGrind
        onCreated={(groupId) => {
          router.push(`/grind/${groupId}`);
        }}
      />
    </main>
  );
}
