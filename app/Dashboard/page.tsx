import { createClient } from "@/lib/supabase/server";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-neutral-500">
          You are not logged in.
        </p>
      </main>
    );
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error loading sessions:", error);
  }

  return (
    <Dashboard
      userEmail={user.email ?? ""}
      sessions={sessions ?? []}
    />
  );
}