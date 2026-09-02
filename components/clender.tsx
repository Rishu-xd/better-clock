
"use client";

import ProgressBar from "./ProgressBar";

type CalendarCardProps = {
  completedDays?: number;
  title?: string;
};

const monthName = (month: number, year: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

export default function CalendarCard({
  completedDays = 0,
  title = "Monthly progress",
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
    <section className="w-full max-w-sm h-30 rounded-2xl bg-white/18 backdrop-blur border p-3 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-800">
          {monthName(currentMonth, currentYear)}
        </span>

        <span className={`font-bold ${completion < 80 ? "text-green-800" : "text-red-800"} text-lg`}>
          {completion}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <ProgressBar value={completion} />
      </div>

      {/* Days */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{completedCount} completed</span>

        <span>{daysInMonth} days</span>
      </div>

    </section>
  );
}

