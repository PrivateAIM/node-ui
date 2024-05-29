import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";
import StyleClass from "primevue/styleclass";

const app = createApp(App);

app
  .use(PrimeVue, { ripple: true })
  .directive("ripple", Ripple)
  .directive("styleclass", StyleClass)
  .mount("#app");
