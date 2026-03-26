import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <OnboardingWizard userName={user.fullName} />;
}
