"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type CreateGrindProps = {
  onCreated?: (groupId: string) => void;
};

export default function CreateGrind({ onCreated }: CreateGrindProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Give your grind a name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You need to be logged in.");
      }

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("grind_groups")
        .insert({
          name: trimmedName,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) {
        throw new Error(groupError.message);
      }

      // Automatically add creator as the first member
      const { error: memberError } = await supabase
        .from("grind_group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) {
        // If joining fails, remove the group we just created.
        await supabase
          .from("grind_groups")
          .delete()
          .eq("id", group.id);

        throw new Error(memberError.message);
      }

      setName("");

      onCreated?.(group.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
      }}
      className="relative w-full max-w-md"
    >
      {/* Soft glow behind the glass */}
      <div
        className="
          pointer-events-none
          absolute -inset-8
          rounded-[2.5rem]
          bg-orange-300/10
          blur-3xl
        "
      />

      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border border-black/[0.07]
          bg-white/55
          p-6
          shadow-[0_20px_70px_rgba(0,0,0,0.08)]
          backdrop-blur-2xl
          dark:border-white/[0.09]
          dark:bg-white/[0.07]
          dark:shadow-[0_20px_70px_rgba(0,0,0,0.22)]
        "
      >
        {/* Glass highlight */}
        <div
          className="
            pointer-events-none
            absolute inset-x-0 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/80
            to-transparent
            dark:via-white/20
          "
        />

        <div className="relative">
          {/* Header */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="
                mb-2
                text-xs
                font-medium
                uppercase
                tracking-[0.18em]
                text-black/40
                dark:text-white/40
              "
            >
              Grind Together
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-black/85
                dark:text-white/90
              "
            >
              Create a grind
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="
                mt-1.5
                text-sm
                leading-relaxed
                text-black/45
                dark:text-white/45
              "
            >
              Start a room and bring people into the grind.
            </motion.p>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label
              htmlFor="grind-name"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-black/65
                dark:text-white/65
              "
            >
              Grind name
            </label>

            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="relative"
            >
              <input
                id="grind-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleCreate();
                  }
                }}
                placeholder="DSA Grind"
                maxLength={40}
                disabled={loading}
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-black/[0.08]
                  bg-white/50
                  px-4
                  text-sm
                  text-black/80
                  outline-none
                  transition-all
                  placeholder:text-black/25
                  focus:border-orange-400/40
                  focus:bg-white/70
                  focus:ring-4
                  focus:ring-orange-400/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-white/[0.09]
                  dark:bg-black/10
                  dark:text-white/85
                  dark:placeholder:text-white/25
                  dark:focus:border-orange-300/30
                  dark:focus:bg-white/[0.08]
                  dark:focus:ring-orange-300/10
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-3
                  right-3
                  text-[10px]
                  tabular-nums
                  text-black/25
                  dark:text-white/25
                "
              >
                {name.length}/40
              </div>
            </motion.div>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                className="
                  mb-4
                  text-sm
                  text-red-500/80
                  dark:text-red-300/80
                "
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            whileHover={!loading ? { y: -1 } : undefined}
            whileTap={!loading ? { scale: 0.98 } : undefined}
            className="
              relative
              flex
              h-12
              w-full
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-black/[0.88]
              text-sm
              font-medium
              text-white
              shadow-lg
              shadow-black/10
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:bg-white/[0.90]
              dark:text-black
              dark:shadow-black/20
            "
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                      dark:border-black/20
                      dark:border-t-black
                    "
                  />
                  Creating...
                </motion.span>
              ) : (
                <motion.span
                  key="create"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  Create Grind
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}