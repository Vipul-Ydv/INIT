import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/20">
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/dashboard/profile">Profile</Link>
          <Link href="/dashboard/connections">Connections</Link>
          <Link href="/dashboard/jobs">Jobs</Link>
        </div>
        <LogoutButton />
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
