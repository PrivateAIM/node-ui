import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Ripple from "primevue/ripple";

const app = createApp(App);

app.use(PrimeVue, { ripple: true }).directive("ripple", Ripple).mount("#app");
