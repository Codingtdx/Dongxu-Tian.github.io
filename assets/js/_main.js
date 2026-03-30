/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

import $ from "jquery";
import fitvids from "fitvids";
import { plotlyDarkLayout, plotlyLightLayout } from "./theme.js";

window.$ = $;
window.jQuery = $;

// This plugin still expects global jQuery, so load it only after globals are set.
import("./plugins/jquery.greedy-navigation.js");

// Determine the expected state of the theme toggle, which can be "dark", "light", or
// "system". Default is "system".
let determineThemeSetting = () => {
  let themeSetting = localStorage.getItem("theme");
  return (themeSetting != "dark" && themeSetting != "light" && themeSetting != "system") ? "system" : themeSetting;
};

// Determine the computed theme, which can be "dark" or "light". If the theme setting is
// "system", the computed theme is determined based on the user's system preference.
let determineComputedTheme = () => {
  let themeSetting = determineThemeSetting();
  if (themeSetting != "system") {
    return themeSetting;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// detect OS/browser preference
const browserPref = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// Set the theme on page load or when explicitly called
let setTheme = (theme) => {
  const root = document.documentElement;
  const themeIcon = document.getElementById("theme-icon");
  const useTheme = theme || localStorage.getItem("theme") || root.getAttribute("data-theme") || browserPref;

  if (useTheme === "dark") {
    root.setAttribute("data-theme", "dark");
    themeIcon?.classList.remove("fa-sun");
    themeIcon?.classList.add("fa-moon");
  } else if (useTheme === "light") {
    root.removeAttribute("data-theme");
    themeIcon?.classList.remove("fa-moon");
    themeIcon?.classList.add("fa-sun");
  }
};

// Toggle the theme manually
var toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  setTheme(newTheme);
};

const smoothScrollToAnchor = (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) {
    return;
  }

  const href = anchor.getAttribute("href");
  if (!href || href === "#") {
    return;
  }

  const target = document.querySelector(href);
  if (!target) {
    return;
  }

  const scssMastheadHeight = 70;
  const y = target.getBoundingClientRect().top + window.scrollY - scssMastheadHeight;
  window.scrollTo({ top: y, behavior: "smooth" });
};

/* ==========================================================================
   Plotly integration script so that Markdown codeblocks will be rendered
   ========================================================================== */

// Read the Plotly data from the code block, hide it, and render the chart as new node. This allows for the
// JSON data to be retrieve when the theme is switched. The listener should only be added if the data is
// actually present on the page.
let plotlyElements = document.querySelectorAll("pre>code.language-plotly");
if (plotlyElements.length > 0) {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      plotlyElements.forEach((elem) => {
        // Parse the Plotly JSON data and hide it
        var jsonData = JSON.parse(elem.textContent);
        elem.parentElement.classList.add("hidden");

        // Add the Plotly node
        let chartElement = document.createElement("div");
        elem.parentElement.after(chartElement);

        // Set the theme for the plot and render it
        const theme = (determineComputedTheme() === "dark") ? plotlyDarkLayout : plotlyLightLayout;
        if (jsonData.layout) {
          jsonData.layout.template = (jsonData.layout.template) ? { ...theme, ...jsonData.layout.template } : theme;
        } else {
          jsonData.layout = { template: theme };
        }
        Plotly.react(chartElement, jsonData.data, jsonData.layout);
      });
    }
  });
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // SCSS SETTINGS - These should be the same as the settings in the relevant files
  const scssLarge = 925; // pixels, from /_sass/_themes.scss

  // If the user hasn't chosen a theme, follow the OS preference
  setTheme();
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    });

  // Enable the theme toggle
  document.getElementById("theme-toggle")?.addEventListener("click", toggleTheme);

  // Enable the sticky footer
  var bumpIt = function () {
    const pageFooter = document.querySelector(".page__footer");
    if (pageFooter) {
      document.body.style.marginBottom = `${pageFooter.offsetHeight}px`;
    }
  };
  var didResize = false;
  window.addEventListener("resize", () => {
    didResize = true;
  });
  setInterval(function () {
    if (didResize) {
      didResize = false;
      bumpIt();
    }
  }, 250);
  bumpIt();

  // FitVids init
  fitvids();

  // Follow menu drop down (sidebar toggle)
  const authorUrls = document.querySelector(".author__urls");
  const authorToggleButton = document.querySelector(".author__urls-wrapper button");
  authorToggleButton?.addEventListener("click", () => {
    if (!authorUrls) {
      return;
    }
    const isVisible = getComputedStyle(authorUrls).display !== "none";
    authorUrls.style.display = isVisible ? "none" : "block";
    authorToggleButton.classList.toggle("open", !isVisible);
  });

  // Restore the follow menu if toggled on a window resize
  window.addEventListener("resize", () => {
    const socialIcons = document.querySelector(".author__urls.social-icons");
    if (!socialIcons || !authorUrls) {
      return;
    }

    if (getComputedStyle(socialIcons).display === "none" && window.innerWidth >= scssLarge) {
      authorUrls.style.display = "block";
    }
  });

  // Native smooth scroll, this needs to be slightly more than the fixed masthead height
  document.addEventListener("click", smoothScrollToAnchor);
});
