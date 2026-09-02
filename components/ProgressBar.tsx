
"use client";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export default function ProgressBar({
  value,
  className = "",
}: ProgressBarProps) {
  const progress = Math.max(0, Math.min(value, 100));

  return (
    <div
      className={`w-full h-3 rounded-full bg-slate-200 overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full ${progress < 80 ? "bg-green-800" : "bg-red-900"} transition-all duration-500`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

