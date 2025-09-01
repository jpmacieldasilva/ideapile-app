/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Inspirado no design do Pile - tons neutros e minimalistas
        background: "#ffffff",
        foreground: "#1a1a1a",
        card: "#f8f9fa",
        "card-foreground": "#1a1a1a",
        primary: "#2563eb",
        "primary-foreground": "#ffffff",
        secondary: "#f1f5f9",
        "secondary-foreground": "#1e293b",
        muted: "#f8fafc",
        "muted-foreground": "#64748b",
        accent: "#f1f5f9",
        "accent-foreground": "#1e293b",
        border: "#e2e8f0",
        input: "#f8fafc",
        ring: "#2563eb",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
