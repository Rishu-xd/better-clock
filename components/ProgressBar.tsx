
"use client";

type ProgressBarProps = {
  value: number;
  className?: string;
  darkMode?: boolean;
};

export default function ProgressBar({
  value,
  className = "",
  darkMode = false,
}: ProgressBarProps) {
  const progress = Math.max(0, Math.min(value, 100));

  return (
    <div
      className={`h-3 w-full overflow-hidden rounded-full transition-colors duration-500 ${darkMode ? "bg-white/10" : "bg-[#171714]/10"} ${className}`}
    >
      <div
        className="h-full rounded-full bg-[#d8ff3f] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

