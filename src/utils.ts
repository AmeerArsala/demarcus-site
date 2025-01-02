import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function invertHexColor(hexColor: string): string {
  // Remove the '#' symbol if present
  let hex = hexColor.replace(/^#/, "");

  // Check if the hex is 3 digits (need to expand to 6)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Validate hex length
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color");
  }

  // Convert hex to RGB
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);

  // Invert RGB components
  const invertedR = 255 - r;
  const invertedG = 255 - g;
  const invertedB = 255 - b;

  // Convert RGB back to hex
  const invertedHex = `#${invertedR.toString(16).padStart(2, "0")}${invertedG.toString(16).padStart(2, "0")}${invertedB.toString(16).padStart(2, "0")}`;

  return invertedHex;
}
