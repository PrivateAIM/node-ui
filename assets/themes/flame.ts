import { definePreset } from "@primevue/themes";
import Lara from "@primevue/themes/lara";

const FlamePreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{yellow.950}',
          inverseColor: '#ffffff',
          hoverColor: '{yellow.900}',
          activeColor: '{yellow.800}'
        },
        highlight: {
          background: '{yellow.950}',
          focusBackground: '{yellow.700}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          color: '{yellow.50}',
          inverseColor: '{yellow.950}',
          hoverColor: '{yellow.100}',
          activeColor: '{yellow.200}'
        },
        highlight: {
          background: 'rgba(25, 250, 250, .16)',
          focusBackground: 'rgba(25, 250, 250, .24)',
          color: 'rgba(25,255,255,.87)',
          focusColor: 'rgba(25,255,255,.87)'
        }
      }
    }
  },
});

export default {
  preset: FlamePreset,
  options: {
  }
};
