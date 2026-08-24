
"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-300 text-gray-800 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        
        <h1 className="text-4xl font-semibold tracking-tight">
          Better Clock
        </h1>

        <p className="mt-3 text-neutral-500 text-sm">
          Your time. Still running.
        </p>

        {/* Actions */}
        <div className="mt-12 flex flex-col gap-3">
          <button
            onClick={() => router.push("/timer")}
            className=" cursor-pointer w-full rounded-xl bg-gray-800 px-6 py-3.5 text-sm font-medium text-gray-300 transition hover:bg-neutral-800 active:scale-[0.98]"
          >
            Start Timer
          </button>

          <button
            onClick={() => router.push("/login")}
            className=" cursor-pointer w-full rounded-xl border border-gray-500 px-6 py-3.5 text-sm font-medium text-gray-800 transition hover:bg-neutral-50 active:scale-[0.98]"
          >
            Login
          </button>
        </div>

        {/* Why login */}
        <div className="mt-8">
          <p className="text-xs leading-relaxed text-neutral-400">
            Want your timer to keep running even after you leave?
            <br />
            <span className="text-neutral-500">
              Log in to save your progress and continue later.
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}

