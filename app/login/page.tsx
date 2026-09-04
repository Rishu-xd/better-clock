
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
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6">

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
      <div className="absolute inset-0 bg-black/5" />


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

            <h1 className="text-4xl font-semibold tracking-tight text-gray-300">
              Better Clock
            </h1>

          </div>

          <p className="mt-2 text-sm text-gray-800">
            Focus better. Track your time.
          </p>
        </div>


        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-400 "
        >

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-600"
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
              className="w-full rounded-xl border border-gray-500 px-4 py-3 outline-none transition focus:border-white focus:border-2 placeholder:text-gray-400"
            />
          </div>


          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-600"
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
              className="w-full rounded-xl border border-gray-500 px-4 py-3 outline-none transition focus:border-white focus:border-2 placeholder:text-gray-400"
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
  className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-neutral-100"
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
            type="submit"
            disabled={loading}
            className="w-full rounded-xl cursor-pointer bg-gray-800 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        {/* Signup */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-medium text-black hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </p>

      </div>
    </main>
  );
}

