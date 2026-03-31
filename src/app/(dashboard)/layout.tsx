import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardNav from "./DashboardNav";
import { EventsProvider } from "@/contexts/EventsContext";
import DashboardShell from "./DashboardShell";

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
    <EventsProvider organizerId={user.organizerId}>
      <DashboardShell
        userInitials={initials}
        userName={user.fullName}
        userEmail={user.email}
      >
        <DashboardNav />
        {children}
      </DashboardShell>
    </EventsProvider>
  );
}
