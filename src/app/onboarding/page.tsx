import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // If onboarding is already completed, redirect to dashboard
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingWizard userName={user.fullName} />;
}
