"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VideoGrindPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
    }).catch(() => setError("Camera access is needed to preview your video."));
    return () => { active = false; streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, []);

  const startVideoChat = async () => {
    setStarting(true);
    setError("");
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      router.push("/login?next=%2Fvideo-grind");
      return;
    }
    const { data: room, error: roomError } = await supabase.from("video_rooms").insert({ host_id: authData.user.id }).select("id").single<{ id: string }>();
    if (roomError || !room) {
      setError(roomError?.message || "Unable to create a video room.");
      setStarting(false);
      return;
    }
    router.push(`/video-grind/${room.id}`);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171714] px-4 py-8 text-[#f9f7f0]">
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="orb orb-one !right-[-11rem] !top-[-8rem] !opacity-70" />
      <div className="orb orb-two !bottom-[-7rem] !left-[-6rem]" />

      <section className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#20201c]/85 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3f]/70">Grind Together</p><h1 className="text-3xl font-semibold tracking-tight">Video Grind</h1><p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">Bring your focus crew into one room. Start a call, copy the invite, and get to work.</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">Up to 20</span></div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#11110f]"><video ref={previewRef} autoPlay muted playsInline className="h-full w-full object-cover" /><div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white/75">Camera preview</div></div>
        {error && <p className="mt-4 rounded-xl bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void startVideoChat()} disabled={starting} className="flex-1 rounded-2xl bg-[#d8ff3f] px-5 py-3 text-sm font-semibold text-[#171714] transition hover:bg-[#c8ed30] disabled:cursor-wait disabled:opacity-60">{starting ? "Opening room..." : "Start video chat"}</button><button type="button" onClick={() => router.push("/grind")} className="rounded-2xl border border-white/15 px-5 py-3 text-sm text-white/70 transition hover:bg-white/[.08]">Back to grind</button></div>
      </section>
    </main>
  );
}