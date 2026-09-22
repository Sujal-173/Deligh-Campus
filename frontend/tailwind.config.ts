import type { Config } from "tailwindcss";

/**
 * Deligh Campus design tokens — pulled directly from the brand guide.
 * Percentage keys (10–100) match how the guide documents each tint/shade,
 * so anyone comparing against the Figma file can match colors 1:1.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        // Primary — deep navy. Core brand identity, sidebars, headings, primary CTAs.
        primary: {
          DEFAULT: "#000052",
          10: "#3A74FF",
          20: "#205CFF",
          30: "#043FFE",
          40: "#0030E4",
          50: "#0028C2",
          60: "#0020A2",
          70: "#001884",
          80: "#001066",
          90: "#00042F",
          100: "#000117",
        },
        // Secondary — indigo. Interactive accents, links, active states.
        secondary: {
          DEFAULT: "#6366F1",
          10: "#C3CBF6",
          20: "#AFB9F6",
          30: "#9CA7F6",
          40: "#8994F5",
          50: "#7881F3",
          60: "#5955F0",
          70: "#4D38EF",
          80: "#4325D9",
          90: "#381EBA",
          100: "#2D179B",
        },
        // Neutral / grey scale for text, borders, surfaces.
        grey: {
          DEFAULT: "#808080",
          5: "#F7F8FA", // synthetic: subtle page background, not in the 10-step brand scale
          10: "#FFFFFF",
          20: "#CECECE",
          30: "#AEAEAE",
          40: "#9E9E9E",
          50: "#8F8F8F",
          60: "#555555",
          70: "#484848",
          80: "#2E2E2E",
          90: "#161616",
          100: "#151515",
        },
        success: {
          DEFAULT: "#22C55E",
          10: "#BCFCCA",
          20: "#8FFAA7",
          30: "#48F27E",
          40: "#35E170",
          50: "#25CF63",
          60: "#199948",
          70: "#107736",
          80: "#095726",
          90: "#033816",
          100: "#021C08",
        },
        warning: {
          DEFAULT: "#F59E0B",
          10: "#FDF1E3",
          20: "#FCE7D0",
          30: "#FAD7B0",
          40: "#FBC17D",
          50: "#FDA934",
          60: "#D98B03",
          70: "#B07004",
          80: "#895703",
          90: "#764A03",
          100: "#653E01",
        },
        error: {
          DEFAULT: "#EF4444",
          10: "#F6D5D1",
          20: "#F5BFB9",
          30: "#F4A79F",
          40: "#F38D85",
          50: "#F2716A",
          60: "#C83133",
          70: "#982425",
          80: "#6B1617",
          90: "#410A0B",
          100: "#1B0303",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,82,0.04), 0 1px 3px 0 rgba(0,0,82,0.06)",
        "card-hover": "0 4px 12px 0 rgba(0,0,82,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
