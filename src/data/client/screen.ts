
// NOTE: GENERATED FILE FROM TAILWIND CONFIG; DO NOT EDIT MANUALLY

// Screen Widths
const SCREEN_WIDTH_PX_0 = 0;
const SCREEN_WIDTH_PX_SM = 640;
const SCREEN_WIDTH_PX_MD = 768;
const SCREEN_WIDTH_PX_LG = 1024;
const SCREEN_WIDTH_PX_XL = 1280;
const SCREEN_WIDTH_PX_2XL = 1400;
const SCREEN_WIDTH_PX_3XL = 2000;

// Normally, you'd make these enums, but we want to be compatible with our tailwind definitions
type TW_SCREEN_SIZE = "0" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

const SCREEN_SIZES_PX_MAP = new Map<TW_SCREEN_SIZE, number>([
  ["0", SCREEN_WIDTH_PX_0],
  ["sm", SCREEN_WIDTH_PX_SM],
  ["md", SCREEN_WIDTH_PX_MD],
  ["lg", SCREEN_WIDTH_PX_LG],
  ["xl", SCREEN_WIDTH_PX_XL],
  ["2xl", SCREEN_WIDTH_PX_2XL],
  ["3xl", SCREEN_WIDTH_PX_3XL],
]);

// "sm" | "md" | "lg" | "xl" | "2xl" | ...
const SCREEN_SIZES: TW_SCREEN_SIZE[] = Array.from(SCREEN_SIZES_PX_MAP.keys());

export {
  SCREEN_WIDTH_PX_0,
  SCREEN_WIDTH_PX_SM,
  SCREEN_WIDTH_PX_MD,
  SCREEN_WIDTH_PX_LG,
  SCREEN_WIDTH_PX_XL,
  SCREEN_WIDTH_PX_2XL,
  SCREEN_WIDTH_PX_3XL,
  SCREEN_SIZES_PX_MAP,
  SCREEN_SIZES,
  type TW_SCREEN_SIZE,
};
