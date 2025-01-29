module.exports = {
  darkMode: "media", // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: [
        '"Inter var", sans-serif',
        {
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
          fontVariationSettings: 'normal'
        },
      ],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("tailwindcss-primeui")],
};
