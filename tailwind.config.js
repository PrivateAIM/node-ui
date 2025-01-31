module.exports = {
  darkMode: "media", // or 'media' or 'class'
  content: [
      "./components/**/*.{js,vue,ts}",
    "./pages/**/*.{js,vue,ts}",
  ],
  theme: {
    fontFamily: {
      // sans: ["Inter var"]
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("tailwindcss-primeui")],
};
