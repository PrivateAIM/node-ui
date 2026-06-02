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
          50: "{slate.50}",
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
        // Stone palette: warm charcoal undertones vs slate's cold blue-grey
        surface: {
          0: "#ffffff",
          50: "{stone.50}",
          100: "{stone.100}",
          200: "{stone.200}",
          300: "{stone.300}",
          400: "{stone.400}",
          500: "{stone.500}",
          600: "{stone.600}",
          700: "{stone.700}",
          800: "{stone.800}",
          900: "{stone.900}",
          950: "{stone.950}",
        },
        primary: {
          color: "{orange.400}",
          contrastColor: "{stone.950}",
          hoverColor: "{orange.300}",
          activeColor: "{orange.200}",
          accentColor: "{orange.600}",
        },
      },
    },
  },
});
