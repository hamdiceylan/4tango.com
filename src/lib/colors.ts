/**
 * Color utilities for event page customization
 */

export interface EventColors {
  primary: string;
  secondary: string;
  dark: string;
}

export const DEFAULT_COLORS: EventColors = {
  primary: "#f43f5e",   // rose-500
  secondary: "#d4a853", // gold accent
  dark: "#0a0a1a",      // dark navy
};

export interface ColorTemplate {
  name: string;
  colors: EventColors;
}

// Section background styles
export type SectionBackground = "light" | "light-alt" | "dark" | "primary" | "gradient";

export interface SectionBackgroundOption {
  value: SectionBackground;
  label: string;
  description: string;
}

export const SECTION_BACKGROUNDS: SectionBackgroundOption[] = [
  { value: "light", label: "Light", description: "White background" },
  { value: "light-alt", label: "Light Alt", description: "Light gray background" },
  { value: "dark", label: "Dark", description: "Dark themed background" },
  { value: "primary", label: "Primary", description: "Primary color background" },
  { value: "gradient", label: "Gradient", description: "Dark gradient background" },
];

export const COLOR_TEMPLATES: ColorTemplate[] = [
  {
    name: "Classic Tango",
    colors: { primary: "#dc2626", secondary: "#fbbf24", dark: "#1c1917" },
  },
  {
    name: "Elegant Rose",
    colors: { primary: "#f43f5e", secondary: "#d4a853", dark: "#0a0a1a" },
  },
  {
    name: "Ocean Breeze",
    colors: { primary: "#0891b2", secondary: "#67e8f9", dark: "#164e63" },
  },
  {
    name: "Royal Purple",
    colors: { primary: "#9333ea", secondary: "#c4b5fd", dark: "#1e1b4b" },
  },
  {
    name: "Forest Green",
    colors: { primary: "#16a34a", secondary: "#86efac", dark: "#14532d" },
  },
  {
    name: "Sunset Gold",
    colors: { primary: "#ea580c", secondary: "#fcd34d", dark: "#431407" },
  },
  {
    name: "Midnight Blue",
    colors: { primary: "#3b82f6", secondary: "#93c5fd", dark: "#0f172a" },
  },
  {
    name: "Cherry Blossom",
    colors: { primary: "#ec4899", secondary: "#fbcfe8", dark: "#500724" },
  },
  {
    name: "Warm Earth",
    colors: { primary: "#b45309", secondary: "#fde68a", dark: "#292524" },
  },
  {
    name: "Monochrome",
    colors: { primary: "#404040", secondary: "#a3a3a3", dark: "#171717" },
  },
];

/**
 * Adjust a hex color by a percentage
 * @param hex - The hex color (e.g., "#ff0000")
 * @param percent - Positive to lighten, negative to darken (-100 to 100)
 * @returns The adjusted hex color
 */
export function adjustColor(hex: string, percent: number): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Adjust each channel
  const adjust = (value: number) => {
    if (percent > 0) {
      // Lighten: move toward 255
      return Math.min(255, Math.round(value + (255 - value) * (percent / 100)));
    } else {
      // Darken: move toward 0
      return Math.max(0, Math.round(value * (1 + percent / 100)));
    }
  };

  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Get event colors with defaults
 */
export function getEventColors(
  primaryColor?: string | null,
  secondaryColor?: string | null,
  darkColor?: string | null
): EventColors {
  return {
    primary: primaryColor || DEFAULT_COLORS.primary,
    secondary: secondaryColor || DEFAULT_COLORS.secondary,
    dark: darkColor || DEFAULT_COLORS.dark,
  };
}

/**
 * Check if a hex color is valid
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Get contrasting text color (black or white) based on background
 */
export function getContrastingTextColor(bgHex: string): string {
  const cleanHex = bgHex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}
