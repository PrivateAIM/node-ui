import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";

// https://primevue.org/theming/styled/#definepreset
export const Flame = definePreset(Lara, {
  semantic: {
    primary: {
      50: "{orange.50}",
      100: "{orange.100}",
      200: "{orange.200}",
      300: "{orange.300}",
      400: "{orange.400}",
      500: "{orange.500}",
      600: "{orange.600}", // Base ember
      700: "{orange.700}",
      800: "{orange.800}",
      900: "{orange.900}",
      950: "{orange.950}",
    },

    surface: {
      0: "#ffffff",
      50: "{slate.50}",
      100: "{slate.100}",
      200: "{slate.200}",
      300: "{slate.300}",
      400: "{slate.400}",
      500: "{slate.500}",
      600: "{slate.600}",
      700: "{slate.700}",
      800: "{slate.800}",
      900: "{slate.900}",
      950: "{slate.950}",
    },

    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "#fff3ea", // Warm ash background
          100: "{slate.100}",
          200: "{slate.200}", // Borders
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },

        primary: {
          color: "{orange.600}", // Ember base (#EA580C)
          contrastColor: "#ffffff",
          hoverColor: "{orange.700}", // Deeper flame
          activeColor: "{red.700}", // Heat peak
          accentColor: "#FDBA74", // Flame highlight
        },
      },
      dark: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
      },
    },
  },
});
