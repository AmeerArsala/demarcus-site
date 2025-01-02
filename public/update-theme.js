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

// "dark" | "light"
const colorTheme = localStorage.getItem("theme");

const COLOR_THEME = {
  get: () => localStorage.getItem("theme"),
  setMode: (mode) => {
    localStorage.setItem("theme", mode);
    onThemeChange(mode);
  }
};

function onThemeChange(theme) {
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
  const PRIMARY_COLOR_SCHEME = ""; // "light" | "dark"

  const currentTheme = COLOR_THEME.get();

  // return theme value in local storage if it is set
  if (currentTheme) return currentTheme;

  // return primary color scheme if it is set
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

function updateTheme() {
  COLOR_THEME.setMode(getPreferTheme());
}

// set early so no page flashes / CSS is made aware
updateTheme();

function setThemeFeature() {
  // set on load so screen readers can get the latest value on the button
  updateTheme();
}

window.onload = () => {
  setThemeFeature();

  // Runs on view transitions navigation
  document.addEventListener("astro:after-swap", setThemeFeature);
};

// sync with system changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    const themeValue = isDark ? "dark" : "light";
    COLOR_THEME.setMode(themeValue);
  });
