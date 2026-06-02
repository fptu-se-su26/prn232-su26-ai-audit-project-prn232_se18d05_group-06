/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core theme colors (mapping back to shadcn-style variables in index.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",

        // SmartLog custom color palette from static design
        "surface-variant": "#273647",
        "surface-tint": "#b4c5ff",
        "error-container": "#93000a",
        "secondary-fixed": "#acedff",
        "outline-variant": "#434655",
        "on-secondary-fixed-variant": "#004e5c",
        "on-error": "#690005",
        "on-primary-container": "#eeefff",
        "primary": "#b4c5ff",
        "on-surface-variant": "#c3c6d7",
        "tertiary-fixed": "#dde2f8",
        "surface-container": "#122131",
        "on-tertiary": "#2a3040",
        "error": "#ffb4ab",
        "inverse-primary": "#0053db",
        "tertiary": "#c1c6db",
        "surface": "#051424",
        "on-primary": "#002a78",
        "on-tertiary-fixed-variant": "#414658",
        "surface-container-low": "#0d1c2d",
        "on-tertiary-container": "#eef0ff",
        "primary-container": "#2563eb",
        "surface-container-lowest": "#010f1f",
        "primary-fixed": "#dbe1ff",
        "on-error-container": "#ffdad6",
        "surface-container-highest": "#273647",
        "on-primary-fixed": "#00174b",
        "on-primary-fixed-variant": "#003ea8",
        "on-tertiary-fixed": "#151b2b",
        "secondary": "#4cd7f6",
        "tertiary-container": "#676d80",
        "secondary-container": "#03b5d3",
        "surface-bright": "#2c3a4c",
        "primary-fixed-dim": "#b4c5ff",
        "on-secondary": "#003640",
        "on-background": "#d4e4fa",
        "surface-container-high": "#1c2b3c",
        "tertiary-fixed-dim": "#c1c6db",
        "on-secondary-fixed": "#001f26",
        "outline": "#8d90a0",
        "surface-dim": "#051424",
        "secondary-fixed-dim": "#4cd7f6",
        "on-surface": "#d4e4fa",
        "inverse-surface": "#d4e4fa",
        "inverse-on-surface": "#233143",
        "on-secondary-container": "#00424e",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "16px",
        "panel-padding": "20px",
        "margin-desktop": "24px",
        "unit": "4px",
        "gutter": "16px"
      },
      fontFamily: {
        "headline-sm": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"],
        "label-caps": ["JetBrains Mono"],
        "data-tabular": ["JetBrains Mono"],
        "headline-md": ["Inter"],
        "display-lg": ["Inter"]
      },
      fontSize: {
        "headline-sm": ["18px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-lg": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "label-caps": ["11px", { "lineHeight": "1", "letterSpacing": "0.08em", "fontWeight": "600" }],
        "data-tabular": ["13px", { "lineHeight": "1", "letterSpacing": "-0.01em", "fontWeight": "500" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "display-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      }
    },
  },
  plugins: [],
}
