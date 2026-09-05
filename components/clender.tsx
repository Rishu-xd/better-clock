
"use client";

import ProgressBar from "./ProgressBar";

type CalendarCardProps = {
  completedDays?: number;
  title?: string;
  darkMode?: boolean;
};

const monthName = (month: number, year: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

export default function CalendarCard({
  completedDays = 0,
  title = "Monthly progress",
  darkMode = false,
}: CalendarCardProps) {
  // Realtime current date
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Number of days in the current month
  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  // Make sure completed days cannot exceed days in the month
  const completedCount = Math.max(
    0,
    Math.min(completedDays, daysInMonth)
  );

  const completion =
    daysInMonth === 0
      ? 0
      : Math.round((completedCount / daysInMonth) * 100);

  return (
    <section className={`w-full max-w-sm overflow-hidden rounded-2xl border p-3 backdrop-blur transition-colors duration-500 ${darkMode ? "border-white/10 bg-white/[.07] text-[#f9f7f0]" : "border-[#171714]/10 bg-white/45 text-[#171714]"}`}>

      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className={darkMode ? "text-[#f9f7f0]" : "text-[#171714]"}>
          {monthName(currentMonth, currentYear)}
        </span>

        <span className="text-lg font-bold text-[#9dc700]">
          {completion}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <ProgressBar value={completion} darkMode={darkMode} />
      </div>

      {/* Days */}
      <div className={`mt-2 flex justify-between text-xs ${darkMode ? "text-white/45" : "text-[#171714]/45"}`}>
        <span>{completedCount} completed</span>

        <span>{daysInMonth} days</span>
      </div>

    </section>
  );
}
