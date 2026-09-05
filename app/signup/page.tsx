
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Background loading state
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.src = "/assets/bg.png";

    img.onload = () => {
      setBackgroundLoaded(true);
    };
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Account created! Check your email to confirm your account."
    );

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1ea] px-6 text-[#171714]">

      {/* ─────────────────────────────
          BACKGROUND
      ───────────────────────────── */}

      {/* Small placeholder — loads immediately */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
        style={{
          backgroundImage: "url('/assets/bgs.jpg')",
        }}
      />

      {/* Full-resolution background */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/assets/bg.png')",
        }}
      />

      {/* Optional subtle overlay */}
      <div className="absolute inset-0 bg-[#f4f1ea]/80 backdrop-blur-[2px]" />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="orb orb-two !bottom-[-8rem] !left-[-8rem]" />


      {/* ─────────────────────────────
          CONTENT
      ───────────────────────────── */}

      <div className="relative z-10 w-full max-w-sm">

        {/* Brand */}
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
            Create your account and start focusing.
          </p>

        </div>


        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="space-y-4 rounded-3xl border border-[#171714]/10 bg-[#fbf9f3]/80 p-6 shadow-[0_20px_60px_rgba(23,23,20,.12)] backdrop-blur"
        >

          {/* Email */}
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


          {/* Password */}
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


          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[#4e4d46]"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#171714]/15 bg-white/70 px-4 py-3 outline-none transition focus:border-[#9dc700] focus:ring-4 focus:ring-[#d8ff3f]/40 placeholder:text-[#8a887d]"
            />
          </div>


          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}


          {/* Success */}
          {success && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
              {success}
            </p>
          )}


          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#d8ff3f] py-3 text-sm font-semibold text-[#171714] transition hover:bg-[#c8ed30] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>


        {/* Login */}
        <p className="mt-6 text-center text-sm text-[#6b6960]">

          Already have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-[#171714] hover:underline"
          >
            Login
          </button>

        </p>

      </div>

    </main>
  );
}

