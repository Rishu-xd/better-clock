
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
  }
};


const handleGitHubLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("GitHub login error:", error.message);
  }
};

  // Controls when the full-resolution background becomes visible
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.src = "/assets/bg3.png";

    img.onload = () => {
      setBackgroundLoaded(true);
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/Dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1ea] px-6 text-[#171714]">

      {/* ─────────────────────────────────────
          BACKGROUND
      ───────────────────────────────────── */}

      {/* Small/blurred image — appears immediately */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
        style={{
          backgroundImage: "url('/assets/bgs.jpg')",
        }}
      />

      {/* Full 4K image — fades in after loading */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/assets/bg.png')",
        }}
      />

      {/* Optional dark/transparent overlay */}
      <div className="absolute inset-0 bg-[#f4f1ea]/80 backdrop-blur-[2px]" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="orb orb-one !right-[-12rem] !top-[-9rem] !opacity-60" />


      {/* ─────────────────────────────────────
          LOGIN CONTENT
      ───────────────────────────────────── */}

      <div
        className={`relative z-10 w-full max-w-sm transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >

        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div className="flex gap-2 justify-center items-center">

            <img
              className="size-10"
              src="/assets/icon.png"
              alt="Better Clock"
            />

            <h1 className="text-4xl font-semibold tracking-tight text-[#171714]">
              Better Clock
            </h1>

          </div>

          <p className="mt-2 text-sm text-[#6b6960]">
            Focus better. Track your time.
          </p>
        </div>


        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-3xl border border-[#171714]/10 bg-[#fbf9f3]/80 p-6 shadow-[0_20px_60px_rgba(23,23,20,.12)] backdrop-blur-sm"
        >

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#4e4d46]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#171714]/15 bg-white/70 px-4 py-3 outline-none transition focus:border-[#9dc700] focus:ring-4 focus:ring-[#d8ff3f]/40 placeholder:text-[#8a887d]"
            />
          </div>


          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#4e4d46]"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#171714]/15 bg-white/70 px-4 py-3 outline-none transition focus:border-[#9dc700] focus:ring-4 focus:ring-[#d8ff3f]/40 placeholder:text-[#8a887d]"
            />
          </div>


          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
  type="button"
  onClick={handleGoogleLogin}
  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#171714]/15 bg-white px-4 py-3 text-sm font-medium text-[#171714] transition hover:bg-[#f1eee5]"
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      fill="#4285F4"
    />
    <path
      d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
      fill="#34A853"
    />
    <path
      d="M6.54 13.59A5.86 5.86 0 0 1 6.23 12c0-.55.1-1.09.31-1.59V7.88H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.12l3.24-2.53Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.44 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8.1 9.46 6.38 12 6.38Z"
      fill="#EA4335"
    />
  </svg>

  Continue with Google
</button>



<button
  type="button"
  onClick={handleGitHubLogin}
  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#171714] bg-[#171714] px-4 py-3 text-sm font-medium text-[#f4f1ea] transition hover:bg-[#33332d]"
>
  <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    
    <title>github [#142]</title>
    <desc>Created with Sketch.</desc>
    <defs>

</defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none">
        <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -7559.000000)" fill="#000000">
            <g id="icons" transform="translate(56.000000, 160.000000)">
                <path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" id="github-[#142]">

</path>
            </g>
        </g>
    </g>
</svg>

  Continue with github
</button>
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-xl bg-[#d8ff3f] py-3 text-sm font-semibold text-[#171714] transition hover:bg-[#c8ed30] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Signup */}
        <p className="mt-6 text-center text-sm text-[#6b6960]">
          Don&apos;t have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="cursor-pointer font-medium text-[#171714] hover:underline"
          >
            Sign up
          </button>
        </p>

      </div>
    </main>
  );
}

