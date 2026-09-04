"use client";

type YourGrindProps = {
  totalSeconds: number;
  soloSeconds: number;
  groupSeconds: number;
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
}: YourGrindProps) {
  const total = Math.max(totalSeconds, 0);
  const solo = Math.max(soloSeconds, 0);
  const group = Math.max(groupSeconds, 0);

  const soloPercentage =
    total > 0 ? Math.round((solo / total) * 100) : 0;

  const groupPercentage =
    total > 0 ? Math.round((group / total) * 100) : 0;

  return (
    <section className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/35 bg-white/[.16] px-5 py-4 shadow-[0_18px_50px_rgba(23,38,39,.10)] backdrop-blur-xl sm:px-6">
      {/* subtle light */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-white/30 blur-3xl" />

      <div className="relative flex min-h-[92px] flex-col justify-between gap-5 sm:flex-row sm:items-center">
        {/* Left */}
        <div className="shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[.2em] text-black/45">
            Your grind
          </p>

          <p className="mt-1 text-xs text-black/40">
            Time you've put in.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-1 items-center justify-center gap-6 sm:gap-10">
          <div>
            <p className="text-3xl font-medium tracking-[-.06em] text-black">
              {formatHours(total)}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-black/40">
              Total
            </p>
          </div>

          <div className="h-10 w-px bg-black/10" />

          <div>
            <p className="text-3xl font-medium tracking-[-.06em] text-black">
              {formatHours(solo)}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-black/40">
              Solo
            </p>
          </div>

          <div className="h-10 w-px bg-black/10" />

          <div>
            <p className="text-3xl font-medium tracking-[-.06em] text-black">
              {formatHours(group)}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[.12em] text-black/40">
              Group
            </p>
          </div>
        </div>

        {/* Distribution */}
        <div className="w-full max-w-[190px] shrink-0">
          <div className="flex justify-between text-[10px] text-black/40">
            <span>Solo</span>
            <span>Group</span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-black transition-all duration-700"
              style={{ width: `${soloPercentage}%` }}
            />
          </div>

          <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-black/30">
            <span>{soloPercentage}%</span>
            <span>{groupPercentage}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}