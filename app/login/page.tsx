
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

