import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FieldType, generateFieldName } from '@/lib/field-types';

// GET /api/events/[id]/form-fields - Get all form fields for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fields = await prisma.eventFormField.findMany({
      where: { eventId: id },
      orderBy: { order: 'asc' },
    });

    // Normalize fields for client consumption
    const normalizedFields = fields.map(field => {
      // Ensure label is always a string (handle i18n labels object)
      let label = field.label;
      if (!label && field.labels && typeof field.labels === 'object') {
        const labels = field.labels as Record<string, string>;
        // Try English first, then first available language
        label = labels.en || Object.values(labels)[0] || field.name;
      }

      return {
        ...field,
        label: label || field.name, // Fallback to name if no label
        options: Array.isArray(field.options) ? field.options : null,
      };
    });

    return NextResponse.json(normalizedFields);
  } catch (error) {
    console.error('Error fetching form fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form fields' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/form-fields - Create a new form field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      fieldType,
      label,
      name,
      placeholder,
      helpText,
      isRequired = false,
      options,
      validation,
      conditionalOn,
    } = body;

    // Validate field type
    const validTypes: FieldType[] = [
      'TEXT', 'EMAIL', 'TEL', 'NUMBER', 'DATE', 'DATETIME',
      'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'URL', 'FILE'
    ];

    if (!validTypes.includes(fieldType)) {
      return NextResponse.json(
        { error: 'Invalid field type' },
        { status: 400 }
      );
    }

    if (!label) {
      return NextResponse.json(
        { error: 'Field label is required' },
        { status: 400 }
      );
    }

    // Get the highest order number for this event
    const lastField = await prisma.eventFormField.findFirst({
      where: { eventId: id },
      orderBy: { order: 'desc' },
    });

    const newOrder = (lastField?.order ?? -1) + 1;

    // Generate field name from label if not provided
    const fieldName = name || generateFieldName(label);

    // Validate options for SELECT and RADIO
    if ((fieldType === 'SELECT' || fieldType === 'RADIO') && (!options || options.length === 0)) {
      return NextResponse.json(
        { error: 'Options are required for select and radio fields' },
        { status: 400 }
      );
    }

    const field = await prisma.eventFormField.create({
      data: {
        eventId: id,
        fieldType: fieldType as FieldType,
        name: fieldName,
        label,
        placeholder,
        helpText,
        isRequired,
        order: newOrder,
        options: options || null,
        validation: validation || null,
        conditionalOn: conditionalOn || null,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error('Error creating form field:', error);
    return NextResponse.json(
      { error: 'Failed to create form field' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id]/form-fields - Reorder fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fieldIds } = body;

    if (!Array.isArray(fieldIds)) {
      return NextResponse.json(
        { error: 'fieldIds must be an array' },
        { status: 400 }
      );
    }

    // Update order for each field
    const updates = fieldIds.map((id: string, index: number) =>
      prisma.eventFormField.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    // Fetch and return updated fields
    const fields = await prisma.eventFormField.findMany({
      where: { eventId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error('Error reordering fields:', error);
    return NextResponse.json(
      { error: 'Failed to reorder fields' },
      { status: 500 }
    );
  }
}
