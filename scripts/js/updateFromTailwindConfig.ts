// Note that this script uses bun

import fs from "fs";
import path from "path";
import tailwindConfig from "!/tailwind.config.mjs";

// Objects from tailwind config
// @ts-ignore
const screens = tailwindConfig.theme.container.screens;
const extraScreens = tailwindConfig.theme.extend.screens;

// Entries that could fill a Map [[key, value], [key, value], ...]
const entries = Object.entries(screens);
entries.push(...Object.entries(extraScreens));

// Sort entries by value (this is important)
entries.sort((a, b) => {
  const aPxStr = a[1] as string;
  const aPxNumber = Number.parseInt(aPxStr.substring(0, aPxStr.length - 2));

  const bPxStr = b[1] as string;
  const bPxNumber = Number.parseInt(bPxStr.substring(0, bPxStr.length - 2));

  return aPxNumber - bPxNumber;
});

const entryMap = new Map(entries);
const screenSizes: string[] = Array.from(entryMap.keys());

// SCREEN_SIZE type string
const TYPE_SCREEN_SIZE = screenSizes.map((sz) => `"${sz}"`).join(" | ");
console.log(TYPE_SCREEN_SIZE);

// Everything else
const screenWidthNames: string[] = [];
const screenWidthDeclarations: string[] = [];
const screenSizesMapEntries: string[] = [];
for (const [sz, str_val] of entries) {
  const strVal = str_val as string;
  const px: number = Number.parseInt(strVal.substring(0, strVal.length - 2));

  // Name
  const screenWidthName = `SCREEN_WIDTH_PX_${sz.toUpperCase()}`;
  screenWidthNames.push(screenWidthName);

  // Declaration
  screenWidthDeclarations.push(`const ${screenWidthName} = ${px};`);

  // Map entry
  screenSizesMapEntries.push(`["${sz}", ${screenWidthName}],`);
}

const FILE_STRING = `
// NOTE: GENERATED FILE FROM TAILWIND CONFIG; DO NOT EDIT MANUALLY

// Screen Widths
${screenWidthDeclarations.join("\n")}

// Normally, you'd make these enums, but we want to be compatible with our tailwind definitions
type TW_SCREEN_SIZE = ${TYPE_SCREEN_SIZE};

const SCREEN_SIZES_PX_MAP = new Map<TW_SCREEN_SIZE, number>([
  ${screenSizesMapEntries.join("\n  ")}
]);

// "sm" | "md" | "lg" | "xl" | "2xl" | ...
const SCREEN_SIZES: TW_SCREEN_SIZE[] = Array.from(SCREEN_SIZES_PX_MAP.keys());

export {
  ${screenWidthNames.join(",\n  ")},
  SCREEN_SIZES_PX_MAP,
  SCREEN_SIZES,
  type TW_SCREEN_SIZE,
};
`;

// Write it to a file
const filePath = path.join(process.cwd(), "src/data/client/screen.ts");
fs.writeFileSync(filePath, FILE_STRING);
