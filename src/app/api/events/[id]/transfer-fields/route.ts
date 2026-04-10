import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FieldType, generateFieldName } from "@/lib/field-types";

// GET /api/events/[id]/transfer-fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fields = await prisma.transferFormField.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      fields.map((field) => ({
        id: field.id,
        eventId: field.eventId,
        fieldType: field.fieldType,
        name: field.name,
        label: typeof field.label === "string" ? field.label : field.name,
        placeholder: typeof field.placeholder === "string" ? field.placeholder : null,
        helpText: typeof field.helpText === "string" ? field.helpText : null,
        isRequired: field.isRequired,
        order: field.order,
        options: field.options,
        validation: field.validation,
        conditionalOn: field.conditionalOn,
        labels: field.labels || null,
        placeholders: field.placeholders || null,
        helpTexts: field.helpTexts || null,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching transfer fields:", error);
    return NextResponse.json({ error: "Failed to fetch fields" }, { status: 500 });
  }
}

// POST /api/events/[id]/transfer-fields
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fieldType, label, name, placeholder, helpText, isRequired, options, validation, conditionalOn } = body;

    const validTypes: FieldType[] = ["TEXT", "EMAIL", "TEL", "NUMBER", "DATE", "DATETIME", "SELECT", "RADIO", "CHECKBOX", "TEXTAREA", "URL", "FILE"];
    if (!validTypes.includes(fieldType)) {
      return NextResponse.json({ error: "Invalid field type" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Field label is required" }, { status: 400 });
    }

    const lastField = await prisma.transferFormField.findFirst({
      where: { eventId: id },
      orderBy: { order: "desc" },
    });

    const field = await prisma.transferFormField.create({
      data: {
        eventId: id,
        fieldType: fieldType as FieldType,
        name: name || generateFieldName(label),
        label,
        placeholder,
        helpText,
        isRequired: isRequired || false,
        order: (lastField?.order ?? -1) + 1,
        options: options || null,
        validation: validation || null,
        conditionalOn: conditionalOn || null,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer field:", error);
    return NextResponse.json({ error: "Failed to create field" }, { status: 500 });
  }
}

// PUT /api/events/[id]/transfer-fields - Reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fieldIds } = await request.json();

    if (!Array.isArray(fieldIds)) {
      return NextResponse.json({ error: "fieldIds must be an array" }, { status: 400 });
    }

    const updates = fieldIds.map((fid: string, index: number) =>
      prisma.transferFormField.update({ where: { id: fid }, data: { order: index } })
    );
    await prisma.$transaction(updates);

    const fields = await prisma.transferFormField.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error reordering transfer fields:", error);
    return NextResponse.json({ error: "Failed to reorder fields" }, { status: 500 });
  }
}
