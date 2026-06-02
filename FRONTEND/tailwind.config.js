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
        // shadcn/ui
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // FleetNova Theme
        "co-background": "#f7f9fb",
        "co-primary": "#004ac6",
        "co-surface-container-low": "#f2f4f6",
        "co-surface-container-lowest": "#ffffff",
        "co-surface-container": "#eceef0",
        "co-tertiary": "#005b7c",
        "co-secondary": "#565e74",
        "co-outline": "#737686",
        "co-outline-variant": "#c3c6d7",
        "co-on-background": "#191c1e",
        "co-on-surface-variant": "#434655",
        "co-primary-fixed-dim": "#b4c5ff",
        "co-error": "#ba1a1a",
        "co-on-primary": "#ffffff",

        // SmartLog Theme
        "surface-variant": "#273647",
        "surface-tint": "#b4c5ff",
        "error-container": "#93000a",
        "secondary-fixed": "#acedff",
        "outline-variant": "#434655",
        "on-secondary-fixed-variant": "#004e5c",
        "on-error": "#690005",
        "on-primary-container": "#eeefff",
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
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },

      spacing: {
        unit: "4px",
        base: "8px",
        "stack-sm": "12px",
        gutter: "24px",
        "margin-mobile": "16px",
        "stack-md": "20px",
        "panel-padding": "20px",
        "margin-desktop": "24px",
        "container-padding": "32px",
        "section-gap": "64px",
      },

      fontFamily: {
        "co-inter": ["Inter", "sans-serif"],
        "co-jakarta": ["Plus Jakarta Sans", "sans-serif"],

        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],

        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],

        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],

        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],

        "label-caps": ["JetBrains Mono", "monospace"],
        "data-tabular": ["JetBrains Mono", "monospace"],

        "display-lg": ["Inter", "sans-serif"],
      },

      fontSize: {
        "display-lg": [
          "48px",
          {
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],

        "headline-lg": [
          "32px",
          {
            lineHeight: "40px",
            letterSpacing: "-0.01em",
            fontWeight: "700",
          },
        ],

        "headline-lg-mobile": [
          "28px",
          {
            lineHeight: "36px",
            fontWeight: "700",
          },
        ],

        "headline-md": [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "600",
          },
        ],

        "headline-sm": [
          "18px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
          },
        ],

        "body-lg": [
          "18px",
          {
            lineHeight: "28px",
            fontWeight: "400",
          },
        ],

        "body-md": [
          "16px",
          {
            lineHeight: "24px",
            fontWeight: "400",
          },
        ],

        "label-sm": [
          "12px",
          {
            lineHeight: "16px",
            letterSpacing: "0.02em",
            fontWeight: "500",
          },
        ],

        "label-md": [
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0.01em",
            fontWeight: "600",
          },
        ],

        "label-caps": [
          "11px",
          {
            lineHeight: "1",
            letterSpacing: "0.08em",
            fontWeight: "600",
          },
        ],

        "data-tabular": [
          "13px",
          {
            lineHeight: "1",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],
      },
    },
  },
  plugins: [],
};