import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // Fetch organizer details
  const organizer = await prisma.organizer.findUnique({
    where: { id: user.organizerId },
  });

  if (!organizer) {
    redirect("/login");
  }

  return (
    <SettingsForm
      initialData={{
        name: user.fullName,
        email: user.email,
        organization: organizer.name,
        currency: organizer.defaultCurrency,
      }}
    />
  );
}
