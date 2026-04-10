import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fieldId: string } }
) {
  try {
    const field = await prisma.transferFormField.findUnique({ where: { id: params.fieldId } });
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    return NextResponse.json(field);
  } catch (error) {
    console.error("Error fetching transfer field:", error);
    return NextResponse.json({ error: "Failed to fetch field" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; fieldId: string } }
) {
  try {
    const body = await request.json();
    const { label, name, placeholder, helpText, isRequired, options, validation, conditionalOn, labels, placeholders, helpTexts } = body;

    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label;
    if (name !== undefined) updateData.name = name;
    if (placeholder !== undefined) updateData.placeholder = placeholder;
    if (helpText !== undefined) updateData.helpText = helpText;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (options !== undefined) updateData.options = options;
    if (validation !== undefined) updateData.validation = validation;
    if (conditionalOn !== undefined) updateData.conditionalOn = conditionalOn;
    if (labels !== undefined) updateData.labels = labels;
    if (placeholders !== undefined) updateData.placeholders = placeholders;
    if (helpTexts !== undefined) updateData.helpTexts = helpTexts;

    const field = await prisma.transferFormField.update({
      where: { id: params.fieldId },
      data: updateData,
    });
    return NextResponse.json(field);
  } catch (error) {
    console.error("Error updating transfer field:", error);
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fieldId: string } }
) {
  try {
    await prisma.transferFormField.delete({ where: { id: params.fieldId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transfer field:", error);
    return NextResponse.json({ error: "Failed to delete field" }, { status: 500 });
  }
}
