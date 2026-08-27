import { createClient } from "@/lib/supabase/server";
import Dashboard from "./Dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User is not logged in
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-neutral-500">
          You are not logged in.
        </p>
      </main>
    );
  }

  // Get sessions belonging to the current user
  //
  // RLS handles the user filtering:
  // auth.uid() = user_id
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Error loading sessions:", error);
  }

  return (
    <Dashboard
      userEmail={user.email ?? ""}
      initialSessions={sessions ?? []}
    />
  );
}