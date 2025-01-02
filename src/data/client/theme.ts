import { SITE } from "@config/siteconfig";
import { persistentAtomIsNull } from "@data/client/stores";
import { persistentAtom } from "@nanostores/persistent";

function applyLightTheme() {
  const elements = document.getElementsByTagName("html");
  for (let i = 0; i < elements.length; ++i) {
    // set each of them
    const element = elements[i];

    element.classList.remove("dark");
    element.classList.add("light");
  }
}

function applyDarkTheme() {
  const elements = document.getElementsByTagName("html");
  for (let i = 0; i < elements.length; ++i) {
    // set each of them
    const element = elements[i];

    element.classList.remove("light");
    element.classList.add("dark");
  }
}

export type Theme = "dark" | "light";

const not = (theme: Theme): Theme => (theme === "dark" ? "light" : "dark");

// "dark" | "light"
const colorTheme = persistentAtom<Theme>("theme");

export const COLOR_THEME = {
  get: () => colorTheme.get(),
  getAtom: () => colorTheme,
  isDarkMode: (): boolean => colorTheme.get() === "dark",
  setMode: (mode: Theme) => {
    colorTheme.set(mode);
    onThemeChange(mode);
  },
  invert: () => {
    const newTheme = not(colorTheme.get());

    colorTheme.set(newTheme);
    onThemeChange(newTheme);
  },
  isDefined: (): boolean => !persistentAtomIsNull(colorTheme),
  getCurrentThemeColorValue: (): string => {
    return SITE.backgroundColor(COLOR_THEME.get() === "dark");
  },
  getThemeColorValue: (theme: string): string => {
    return SITE.backgroundColor(theme === "dark");
  },
};

function onThemeChange(theme: Theme) {
  if (theme === "dark") {
    applyDarkTheme();
  } else {
    applyLightTheme();
  }

  reflectThemePreference();
}

function getWindowPreferTheme() {
  // return user device's prefer color scheme
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getPreferTheme() {
  // set this if you want a default to go to if the user hasn't already chosen a theme (like when they first visit the site)
  const PRIMARY_COLOR_SCHEME: Theme | "" = ""; // "light" | "dark"

  const currentTheme = COLOR_THEME.get();

  // return theme value in local storage if it is set
  if (currentTheme) return currentTheme;

  // return primary color scheme if it is set by the programmer
  if (PRIMARY_COLOR_SCHEME) return PRIMARY_COLOR_SCHEME;

  // return user device's prefer color scheme
  return getWindowPreferTheme();
}

function reflectThemePreference() {
  const themeValue = COLOR_THEME.get();

  document.firstElementChild.setAttribute("data-theme", themeValue);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  // Get a reference to the body element
  const body = document.body;

  // Check if the body element exists before using getComputedStyle
  if (body) {
    // Get the computed styles for the body element
    const computedStyles = window.getComputedStyle(body);

    // Get the background color property
    const bgColor = computedStyles.backgroundColor;

    // Set the background color in <meta theme-color ... />
    document.querySelector("meta[name='theme-color']")?.setAttribute("content", bgColor);
  }
}

export function updateTheme() {
  COLOR_THEME.setMode(getPreferTheme());
}
