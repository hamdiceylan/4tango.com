// Field type definitions for the form builder

export type FieldType =
  | 'TEXT'
  | 'EMAIL'
  | 'TEL'
  | 'NUMBER'
  | 'DATE'
  | 'DATETIME'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'TEXTAREA'
  | 'URL'
  | 'FILE';

// Option for SELECT and RADIO fields
export interface FieldOption {
  value: string;
  label: string;
}

// Validation rules
export interface FieldValidation {
  min?: number; // For NUMBER: minimum value
  max?: number; // For NUMBER: maximum value
  minLength?: number; // For TEXT/TEXTAREA: minimum character length
  maxLength?: number; // For TEXT/TEXTAREA: maximum character length
  pattern?: string; // Regex pattern for validation
  patternMessage?: string; // Custom error message for pattern validation
  minDate?: string; // For DATE/DATETIME: minimum date (ISO string)
  maxDate?: string; // For DATE/DATETIME: maximum date (ISO string)
  acceptedFileTypes?: string[]; // For FILE: accepted MIME types
  maxFileSize?: number; // For FILE: max file size in bytes
}

// Conditional display rules
export interface ConditionalRule {
  fieldName: string; // The field name to check
  operator?: 'equals' | 'notEquals' | 'contains' | 'notEmpty';
  value?: string | string[] | boolean; // The value to compare against
}

// Full form field interface matching the Prisma model
export interface EventFormField {
  id: string;
  eventId: string;
  fieldType: FieldType;
  name: string; // Internal field name (e.g., "check_in_date")
  label: string; // Display label (e.g., "Check-in Date")
  placeholder?: string | null;
  helpText?: string | null;
  isRequired: boolean;
  order: number;
  options?: FieldOption[] | null; // For SELECT/RADIO
  validation?: FieldValidation | null;
  conditionalOn?: ConditionalRule | null;
  createdAt: Date;
  updatedAt: Date;
}

// Field metadata for the UI
export interface FieldTypeInfo {
  type: FieldType;
  name: string;
  description: string;
  icon: string;
  hasOptions: boolean; // Whether this field type needs options (SELECT, RADIO)
  defaultPlaceholder?: string;
}

export const FIELD_TYPES: FieldTypeInfo[] = [
  {
    type: 'TEXT',
    name: 'Text',
    description: 'Single line text input',
    icon: 'type',
    hasOptions: false,
    defaultPlaceholder: 'Enter text...',
  },
  {
    type: 'EMAIL',
    name: 'Email',
    description: 'Email address input with validation',
    icon: 'at-sign',
    hasOptions: false,
    defaultPlaceholder: 'email@example.com',
  },
  {
    type: 'TEL',
    name: 'Phone',
    description: 'Phone number input',
    icon: 'phone',
    hasOptions: false,
    defaultPlaceholder: '+1 (555) 123-4567',
  },
  {
    type: 'NUMBER',
    name: 'Number',
    description: 'Numeric input with optional min/max',
    icon: 'hash',
    hasOptions: false,
    defaultPlaceholder: '0',
  },
  {
    type: 'DATE',
    name: 'Date',
    description: 'Date picker',
    icon: 'calendar',
    hasOptions: false,
  },
  {
    type: 'DATETIME',
    name: 'Date & Time',
    description: 'Date and time picker',
    icon: 'clock',
    hasOptions: false,
  },
  {
    type: 'SELECT',
    name: 'Dropdown',
    description: 'Single selection from a dropdown list',
    icon: 'chevron-down',
    hasOptions: true,
    defaultPlaceholder: 'Select an option...',
  },
  {
    type: 'RADIO',
    name: 'Radio Buttons',
    description: 'Single selection from visible options',
    icon: 'circle',
    hasOptions: true,
  },
  {
    type: 'CHECKBOX',
    name: 'Checkbox',
    description: 'Single checkbox for yes/no or agreement',
    icon: 'check-square',
    hasOptions: false,
  },
  {
    type: 'TEXTAREA',
    name: 'Long Text',
    description: 'Multi-line text area',
    icon: 'align-left',
    hasOptions: false,
    defaultPlaceholder: 'Enter your text here...',
  },
  {
    type: 'URL',
    name: 'URL',
    description: 'Website or social media link',
    icon: 'link',
    hasOptions: false,
    defaultPlaceholder: 'https://',
  },
  {
    type: 'FILE',
    name: 'File Upload',
    description: 'File attachment (images, documents)',
    icon: 'paperclip',
    hasOptions: false,
  },
];

export function getFieldTypeInfo(type: FieldType): FieldTypeInfo | undefined {
  return FIELD_TYPES.find((f) => f.type === type);
}

// Default fields that are always present in the registration form
export const DEFAULT_REGISTRATION_FIELDS = [
  { name: 'firstName', label: 'First Name', type: 'TEXT' as FieldType, isRequired: true },
  { name: 'lastName', label: 'Last Name', type: 'TEXT' as FieldType, isRequired: true },
  { name: 'email', label: 'Email', type: 'EMAIL' as FieldType, isRequired: true },
  { name: 'role', label: 'Dance Role', type: 'RADIO' as FieldType, isRequired: true },
];

// Generate a URL-friendly field name from a label
export function generateFieldName(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

// Validate a field value against its validation rules
export function validateFieldValue(
  value: string | boolean | null | undefined,
  field: EventFormField
): string | null {
  // Check required
  if (field.isRequired) {
    if (value === null || value === undefined || value === '') {
      return `${field.label} is required`;
    }
  }

  // Skip further validation if value is empty and not required
  if (!value) return null;

  const validation = field.validation;
  if (!validation) return null;

  const strValue = String(value);

  // String length validation
  if (validation.minLength && strValue.length < validation.minLength) {
    return `${field.label} must be at least ${validation.minLength} characters`;
  }
  if (validation.maxLength && strValue.length > validation.maxLength) {
    return `${field.label} must be no more than ${validation.maxLength} characters`;
  }

  // Number validation
  if (field.fieldType === 'NUMBER') {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return `${field.label} must be a valid number`;
    }
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }
  }

  // Pattern validation
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(strValue)) {
      return validation.patternMessage || `${field.label} format is invalid`;
    }
  }

  return null;
}
