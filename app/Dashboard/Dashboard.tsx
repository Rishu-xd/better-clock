"use client";

import { useRouter } from "next/navigation";

type Session = {
  id: string;
  name: string | null;
  duration: number;
  started_at: string | null;
  completed_at: string | null;
};

type DashboardProps = {
  userEmail: string;
  sessions: Session[];
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatDate(date: string | null) {
  if (!date) return "In progress";

  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Dashboard({
  userEmail,
  sessions,
}: DashboardProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-4xl">

        {/* HEADER */}

        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">
              Better Clock
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {userEmail}
            </p>
          </div>

          <button
            onClick={() => router.push("/timer")}
            className="
              rounded-full
              border
              border-zinc-800
              px-6
              py-3
              text-sm
              transition
              hover:border-zinc-600
              hover:bg-zinc-900
              active:scale-95
              cursor-pointer
            "
          >
            Create Task
          </button>
        </header>

        {/* SESSIONS */}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-400">
              Sessions
            </h2>

            <span className="text-xs text-zinc-600">
              {sessions.length} total
            </span>
          </div>

          {sessions.length === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-zinc-900
                px-6
                py-12
                text-center
              "
            >
              <p className="text-sm text-zinc-500">
                No sessions yet.
              </p>

              <button
                onClick={() => router.push("/timer")}
                className="
                  mt-4
                  text-sm
                  text-white
                  underline
                  underline-offset-4
                  opacity-70
                  transition
                  hover:opacity-100

                  cursor-pointer
                "
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-zinc-900
                    px-5
                    py-4
                    transition
                    hover:border-zinc-800
                    hover:bg-zinc-950
                  "
                >
                  {/* TASK */}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {session.name ||
                        "Unnamed task"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {formatDate(
                        session.started_at
                      )}
                    </p>
                  </div>

                  {/* DURATION */}

                  <div className="ml-6 text-right">
                    <p className="text-sm tabular-nums text-zinc-300">
                      {formatDuration(
                        session.duration
                      )}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        session.completed_at
                          ? "text-zinc-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {session.completed_at
                        ? "Completed"
                        : "In progress"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}