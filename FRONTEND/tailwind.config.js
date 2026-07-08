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
        background: "hsl(var(--background))",
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
        "surface-variant": "var(--surface-variant)",
        "surface-tint": "#b4c5ff",
        "error-container": "#ffdad6",
        "secondary-fixed": "#acedff",
        "outline-variant": "var(--outline-variant)",
        "on-secondary-fixed-variant": "#004e5c",
        "on-error": "#690005",
        "on-primary-container": "#eeefff",
        "on-surface-variant": "var(--on-surface-variant)",
        "tertiary-fixed": "#dae2fd",
        "surface-container": "#eceef0",
        "on-tertiary": "#2a3040",
        "error": "var(--error)",
        "inverse-primary": "#b4c5ff",
        "tertiary": "#4d556b",
        "surface": "var(--surface)",
        "on-primary": "#ffffff",
        "on-tertiary-fixed-variant": "#3f465c",
        "surface-container-low": "#f2f4f6",
        "on-tertiary-container": "#eef0ff",
        "primary-container": "#2563eb",
        "surface-container-lowest": "#ffffff",
        "primary-fixed": "#dbe1ff",
        "on-error-container": "#ffdad6",
        "surface-container-highest": "#e0e3e5",
        "on-primary-fixed": "#00174b",
        "on-primary-fixed-variant": "#003ea8",
        "on-tertiary-fixed": "#131b2e",
        "tertiary-container": "#656d84",
        "secondary-container": "#57dffe",
        "surface-bright": "#f7f9fb",
        "primary-fixed-dim": "#b4c5ff",
        "outline": "#737686",
        "primary": "#004ac6",
        "secondary": "#00687a",
        "on-surface": "var(--on-surface)",
        "tertiary-fixed-dim": "#bec6e0",
        "surface-container-high": "#e6e8ea",
        "on-secondary-fixed": "#001f26",
        "secondary-fixed-dim": "#4cd7f6",
        "inverse-surface": "#2d3133",
        "background": "#f7f9fb",
        "inverse-on-surface": "#eff1f3",
        // Keep existing colors just in case
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        
        // NexusPort Template Colors
        "signal-orange": "#ff682c",
        "dark-canvas": "#141414",
        "dark-card": "#1f1f1f",
        "dark-surface": "#2a2a2a",
        "mist": "#efefef",
        "paper": "#ffffff",
        "chalk": "#e8e8e8",
        "slate": "#828282",
        "fog": "#f5f5f5",
        "graphite": "#4d4d4d",
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
        "margin-desktop": "32px",
        "container-padding": "32px",
        "section-gap": "64px",
        "sidebar-width": "200px",
        "card-padding-lg": "40px",
        "card-padding-sm": "32px",
      },

      fontFamily: {
        "co-inter": ["Inter", "sans-serif"],
        "co-jakarta": ["Plus Jakarta Sans", "sans-serif"],

        "headline-lg": ["Space Grotesk", "sans-serif"],
        "headline-lg-mobile": ["Space Grotesk", "sans-serif"],

        "headline-md": ["Space Grotesk", "sans-serif"],
        "headline-sm": ["Space Grotesk", "sans-serif"],

        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],

        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],

        "label-caps": ["JetBrains Mono", "monospace"],
        "data-tabular": ["JetBrains Mono", "monospace"],

        "display-lg": ["Inter", "sans-serif"],
        
        caption: ["Inter", "sans-serif"],
        "ui-compact": ["Inter", "sans-serif"],
        "ui-standard": ["Inter", "sans-serif"],
        "section-head": ["Space Grotesk", "sans-serif"],
        "label-xs": ["Inter", "sans-serif"],
        "display-hero": ["Space Grotesk", "sans-serif"],
        "mono": ["Space Grotesk", "monospace"]
      },

      fontSize: {
        "display-large": ["57px", "64px"],
        "display-medium": ["45px", "52px"],
        "display-small": ["36px", "44px"],

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
          "14px",
          {
            lineHeight: "20px",
            letterSpacing: "0",
            fontWeight: "400",
          },
        ],
      },
      
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(400px)' },
        }
      },
      animation: {
        scan: 'scan 2s ease-in-out infinite',
      },

      boxShadow: {
        subtle:
          "0px 1px 2px 0px rgba(0, 0, 0, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
        floating:
          "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 12px 16px -4px rgba(0, 0, 0, 0.1)",
        "floating-lg":
          "0px 8px 12px -2px rgba(0, 0, 0, 0.15), 0px 4px 6px -4px rgba(0, 0, 0, 0.15), 0px 24px 32px -8px rgba(0, 0, 0, 0.15)",
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};