"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const features = [
  ["01", "Timer with intent", "Set one clear target. See time move. Finish knowing where your day went.", "◷"],
  ["02", "Records that tell truth", "Your focus history is more than a streak—it is evidence that you showed up.", "↗"],
  ["03", "Grind together", "Create a room, see your crew in focus, and let shared standards pull everyone forward.", "◉"],
];

export default function LandingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace("/Dashboard");
    };
    void checkUser();
  }, [router, supabase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1ea] text-[#171714] selection:bg-[#d8ff3f]">
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="orb orb-one" /><div className="orb orb-two" />

      <nav className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-3 text-left">
          <span className="grid size-10 place-items-center rounded-full bg-[#171714] text-lg text-[#d8ff3f] shadow-[4px_4px_0_#d8ff3f]">◷</span>
          <span className="text-lg font-semibold tracking-[-0.04em]">betterclock</span>
        </button>
        <div className="flex items-center gap-3 text-sm font-medium">
          <button onClick={() => router.push("/login")} className="hidden px-3 py-2 hover:opacity-60 sm:block">Sign in</button>
          <button onClick={() => router.push("/signup")} className="rounded-full bg-[#171714] px-5 py-2.5 text-[#f4f1ea] transition hover:-translate-y-0.5 hover:bg-[#33332d]">Join the grind</button>
        </div>
      </nav>

      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_.95fr] md:px-10 md:pb-28 md:pt-20">
        <div className="animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/45 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="size-2 animate-pulse rounded-full bg-[#9dc700]" /> Build your edge, daily
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.075em] sm:text-6xl lg:text-8xl">
            Make your time <span className="relative inline-block italic font-medium"><span className="relative z-10">count.</span><span className="absolute inset-x-0 bottom-1 h-[0.28em] -rotate-1 bg-[#d8ff3f]" /></span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-[#5e5d54] sm:text-lg">BetterClock turns focused hours into proof. Run your timer, track the work that compounds, and find your pace alongside people who refuse to coast.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button onClick={() => router.push("/timer")} className="group flex items-center gap-3 rounded-full bg-[#171714] px-6 py-3.5 text-sm font-semibold text-[#f4f1ea] transition hover:-translate-y-1 hover:shadow-[0_10px_0_#d8ff3f]">Start a focus session <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span></button>
            <button onClick={() => router.push("/grind")} className="rounded-full border border-[#171714]/20 bg-white/40 px-6 py-3.5 text-sm font-semibold transition hover:border-[#171714] hover:bg-white">Find your people</button>
          </div>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-[#77756b]">No streak pressure. Just honest work.</p>
        </div>

        <div className="animate-float relative mx-auto w-full max-w-md">
          <div className="absolute -inset-5 -z-10 rotate-3 rounded-[2rem] bg-[#d8ff3f]" />
          <div className="rounded-[1.8rem] border border-white/80 bg-[#20201c] p-5 text-[#f9f7f0] shadow-2xl sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-[0.18em] text-white/50">Deep work</p><p className="mt-1 text-sm font-semibold">Friday, 05 September</p></div><span className="grid size-10 place-items-center rounded-full bg-[#d8ff3f] text-xl text-[#171714]">◷</span></div>
            <div className="py-8 text-center"><p className="font-mono text-6xl font-medium tracking-[-0.08em] sm:text-7xl">48:32</p><div className="mx-auto mt-6 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[72%] rounded-full bg-[#d8ff3f]" /></div><p className="mt-3 text-xs text-white/45">72% through today&apos;s intention</p></div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 text-center"><div><p className="text-lg font-semibold">4h 12m</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">This week</p></div><div><p className="text-lg font-semibold text-[#d8ff3f]">+18%</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Momentum</p></div><div><p className="text-lg font-semibold">#06</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">Your rank</p></div></div>
          </div>
          <div className="animate-bob absolute -bottom-7 -left-7 rounded-2xl border border-black/10 bg-[#f9f7f0] px-4 py-3 shadow-lg"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#77756b]">Squad status</p><p className="mt-1 text-sm font-semibold"><span className="mr-1.5 inline-block size-2 rounded-full bg-[#9dc700]" />8 friends in flow</p></div>
        </div>
      </section>

      <section className="relative border-y border-black/10 bg-[#e9e5db]/70 px-6 py-7 md:px-10"><p className="mx-auto max-w-7xl text-center text-lg font-medium tracking-[-0.03em] text-[#3e3d37] sm:text-2xl">“Discipline is choosing between what you want now and what you want most.” <span className="text-[#88857b]">— a standard worth keeping</span></p></section>
      <section className="relative mx-auto grid w-full max-w-7xl gap-4 px-6 py-20 md:grid-cols-3 md:px-10">
        {features.map(([number, title, copy, icon]) => <article key={title} className="group rounded-3xl border border-black/10 bg-white/35 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl sm:p-8"><span className="font-mono text-xs text-[#8a887d]">{number}</span><div className="mt-10 grid size-11 place-items-center rounded-full bg-[#e7e3d9] text-lg">{icon}</div><h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">{title}</h2><p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6b6960]">{copy}</p></article>)}
      </section>
      <footer className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-black/10 px-6 py-8 text-sm text-[#77756b] sm:flex-row sm:items-center sm:justify-between md:px-10"><p>BetterClock — for the work no one sees.</p><button onClick={() => router.push("/timer")} className="font-semibold text-[#171714] hover:opacity-60">Start now ↗</button></footer>
    </main>
  );
}
