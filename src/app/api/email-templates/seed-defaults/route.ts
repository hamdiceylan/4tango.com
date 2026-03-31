import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { seedDefaultTemplates, getDefaultTemplateNames } from "@/lib/email-templates/seed-defaults";

// POST /api/email-templates/seed-defaults - Seed default templates for organizer
export async function POST() {
  try {
    const auth = await requireAuth();

    const created = await seedDefaultTemplates(auth.organizerId);

    return NextResponse.json({
      success: true,
      message: created > 0
        ? `Created ${created} default template(s)`
        : "All default templates already exist",
      created,
      templateNames: getDefaultTemplateNames(),
    });
  } catch (error) {
    console.error("Error seeding default templates:", error);
    return NextResponse.json(
      { error: "Failed to seed default templates" },
      { status: 500 }
    );
  }
}
