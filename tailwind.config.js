/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "spiral-blue": "#084FAA",
        "spiral-dark-blue": "#01152A",
        "spiral-gray": "#15202D",
        "spiral-black": "#03050D",
        "spiral-yellow": "#fde047",
        "spiral-red": "#ef4444",
        "spiral-green": "#4ade80",
        "spiral-light-gray": "#8E8E8E",
      },
    },
  },
  plugins: [],
};
