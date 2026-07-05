/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#5d4f73",
          "primary-content": "#ffffff",
          secondary: "#f9a8d4",
          accent: "#f472b6",
          neutral: "#374151",
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",
          "base-300": "#e5e7eb",
          "base-content": "#1f2937",
          info: "#38bdf8",
          success: "#4ade80",
          warning: "#facc15",
          error: "#f87171",
        },
      },
    ],
  },
};
