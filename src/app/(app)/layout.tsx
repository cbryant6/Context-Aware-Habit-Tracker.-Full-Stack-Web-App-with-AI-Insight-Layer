import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar email={user.email ?? ""} />
      <div className="bg-gray-50">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 min-h-[calc(100dvh-6rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
