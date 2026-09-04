"use client";

import { useRouter } from "next/navigation";
import CreateGrind from "@/components/grind/CreateGrind";

export default function GrindTogetherPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <CreateGrind
        onCreated={(groupId) => {
          router.push(`/grind/${groupId}`);
        }}
      />
    </main>
  );
}