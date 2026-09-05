"use client";

type YourGrindProps = {
  totalSeconds: number;
  soloSeconds: number;
  groupSeconds: number;
  theme: boolean; // true = dark mode, false = light mode
};

function formatHours(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;

  return `${hours}h ${minutes}m`;
}

export default function YourGrind({
  totalSeconds,
  soloSeconds,
  groupSeconds,
  theme,
}: YourGrindProps) {
  const isDark = theme;

  const total = Math.max(totalSeconds, 0);
  const solo = Math.max(soloSeconds, 0);
  const group = Math.max(groupSeconds, 0);

  const soloPercentage =
    total > 0 ? Math.round((solo / total) * 100) : 0;

  const groupPercentage =
    total > 0 ? Math.round((group / total) * 100) : 0;

  return (
    <section
      className={`relative w-full overflow-hidden rounded-[1.5rem] border px-5 py-4 shadow-[0_18px_50px_rgba(23,38,39,.10)] backdrop-blur-xl sm:px-6 ${
        isDark
          ? "border-white/10 bg-black/40"
          : "border-white/35 bg-white/[.16]"
      }`}
    >
      {/* subtle light */}
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl ${
          isDark ? "bg-white/10" : "bg-white/30"
        }`}
      />

      <div className="relative flex min-h-[92px] flex-col justify-between gap-5 sm:flex-row sm:items-center">
        {/* Left */}
        <div className="shrink-0">
          <p
            className={`text-[11px] font-medium uppercase tracking-[.2em] ${
              isDark ? "text-white/45" : "text-black/45"
            }`}
          >
            Your grind
          </p>

          <p className={`mt-1 text-xs ${isDark ? "text-white/40" : "text-black/40"}`}>
            Time you've put in.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-1 items-center justify-center gap-6 sm:gap-10">
          <div>
            <p
              className={`text-3xl font-medium tracking-[-.06em] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {formatHours(total)}
            </p>

            <p
              className={`mt-1 text-[10px] uppercase tracking-[.12em] ${
                isDark ? "text-white/40" : "text-black/40"
              }`}
            >
              Total
            </p>
          </div>

          <div className={`h-10 w-px ${isDark ? "bg-white/10" : "bg-black/10"}`} />

          <div>
            <p
              className={`text-3xl font-medium tracking-[-.06em] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {formatHours(solo)}
            </p>

            <p
              className={`mt-1 text-[10px] uppercase tracking-[.12em] ${
                isDark ? "text-white/40" : "text-black/40"
              }`}
            >
              Solo
            </p>
          </div>

          <div className={`h-10 w-px ${isDark ? "bg-white/10" : "bg-black/10"}`} />

          <div>
            <p
              className={`text-3xl font-medium tracking-[-.06em] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {formatHours(group)}
            </p>

            <p
              className={`mt-1 text-[10px] uppercase tracking-[.12em] ${
                isDark ? "text-white/40" : "text-black/40"
              }`}
            >
              Group
            </p>
          </div>
        </div>

        {/* Distribution */}
        <div className="w-full max-w-[190px] shrink-0">
          <div
            className={`flex justify-between text-[10px] ${
              isDark ? "text-white/40" : "text-black/40"
            }`}
          >
            <span>Solo</span>
            <span>Group</span>
          </div>

          <div
            className={`mt-2 h-1.5 overflow-hidden rounded-full ${
              isDark ? "bg-white/10" : "bg-black/10"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDark ? "bg-white" : "bg-black"
              }`}
              style={{ width: `${soloPercentage}%` }}
            />
          </div>

          <div
            className={`mt-1.5 flex justify-between text-[10px] tabular-nums ${
              isDark ? "text-white/30" : "text-black/30"
            }`}
          >
            <span>{soloPercentage}%</span>
            <span>{groupPercentage}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}