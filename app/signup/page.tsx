
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
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6">

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
      <div className="absolute inset-0 bg-black/5" />


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

            <h1 className="text-4xl font-semibold tracking-tight text-gray-100">
              Better Clock
            </h1>

          </div>

          <p className="mt-2 text-sm text-gray-500">
            Create your account and start focusing.
          </p>

        </div>


        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="space-y-4 backdrop-blur border border-gray-400 rounded-xl p-6 shadow-lg bg-white/10"
        >

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-500"
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
              className="w-full rounded-xl border border-gray-400 px-4 py-3 outline-none transition focus:border-white placeholder:text-gray-100"
            />
          </div>


          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-500"
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
              className="w-full rounded-xl border border-gray-400 px-4 py-3 outline-none transition focus:border-white placeholder:text-gray-100"
            />
          </div>


          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-500"
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
              className="w-full rounded-xl border border-gray-400 px-4 py-3 outline-none transition focus:border-white placeholder:text-gray-100"
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
            className="w-full rounded-xl bg-white py-3 text-sm font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>


        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-500">

          Already have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-black hover:underline"
          >
            Login
          </button>

        </p>

      </div>

    </main>
  );
}

