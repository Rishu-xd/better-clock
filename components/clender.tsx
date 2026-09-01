'use client';

type CalendarCardProps = {
  totalDots?: number;
  /** Number of dots to mark as completed. */
  filledDots?: number;
  /** Zero-based month index: 0 = January, 11 = December. */
  month?: number;
  year?: number;
  title?: string;
};

const monthName = (month: number, year: number) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );

export default function CalendarCard({
  totalDots,
  filledDots = 0,
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  title = 'Monthly progress',
}: CalendarCardProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayCount = Math.max(0, Math.min(totalDots ?? daysInMonth, daysInMonth));
  const completedCount = Math.max(0, Math.min(filledDots, dayCount));
  const leadingEmptyDays = new Date(year, month, 1).getDay();
  const completion = dayCount === 0 ? 0 : Math.round((completedCount / dayCount) * 100);

  return (
    <section className="w-full max-w-sm  h-30 rounded-2xl bg-white/18   backdrop-blur   border-1 p-2  overflow-hidden">
  
          <div className=" flex items-center justify-between  border-slate-100  text-sm">
            <span className="text-gray-800">{monthName(month, year)}</span>
            <span className="font-bold text-white text-lg">
              {completedCount/dayCount * 100}%
            </span>
          </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-1">
        {Array.from({ length: leadingEmptyDays }).map((_, index) => (
          <span aria-hidden="true" key={`empty-${index}`} />
        ))}
        {Array.from({ length: dayCount }, (_, index) => {
          const day = index + 1;
          const isCompleted = day <= completedCount;

          return (
            <div key={day} className="flex flex-col items-center ">
              <span
                aria-label={`Day ${day}: ${isCompleted ? 'completed' : 'remaining'}`}
                className={`h-3 w-3 rounded-full transition-colors ${
                  isCompleted
                    ? 'bg-gray-800 shadow-[0_5px_12px_-5px_rgba(255,255,255,0.5)]'
                    : 'bg-slate-200'
                }`}
              />
              {/* <span className="text-[10px] font-medium text-slate-500">{day}</span> */}
            </div>
          );
        })}
      </div>

    </section>
  );
}
