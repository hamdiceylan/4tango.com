import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // Check if organizer needs onboarding
  if (!user.onboardingCompleted) {
    // Check if organizer has any events
    const eventCount = await prisma.event.count({
      where: { organizerId: user.organizerId },
    });

    // If no events and onboarding not completed, redirect to onboarding
    // (onboarding page is outside this layout, so no redirect loop)
    if (eventCount === 0) {
      redirect("/onboarding");
    }
  }

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">4T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">4Tango</span>
          </Link>
        </div>

        <DashboardNav />

        <div className="absolute bottom-24 left-4 right-4">
          <Link
            href="/events/new"
            className="flex items-center justify-center gap-2 w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-rose-500/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <span className="font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <Link href="/api/auth/logout" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
