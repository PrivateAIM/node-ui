<script lang="ts" setup>
import MenuHeader from "~/components/header/MenuHeader.vue";
import Footer from "~/components/Footer.vue";
import type { ToastMessageOptions } from "primevue/toast";

const pauseToastTimer = () => {};

const toastPt = {
  message: ({ props }: { props: { message: ToastMessageOptions } }) => {
    const life = props.message.life;
    return life
      ? { "data-toast-life": true, style: { "--toast-life": `${life}ms` } }
      : {};
  },
};
</script>

<template>
  <Toast
    position="top-right"
    :pt="toastPt"
    :onMouseEnter="pauseToastTimer"
    :onMouseLeave="pauseToastTimer"
  />
  <NuxtLoadingIndicator color="var(--p-primary-color)" />
  <div class="app-container">
    <MenuHeader />
    <NuxtLayout>
      <main class="page-content">
        <NuxtPage />
      </main>
    </NuxtLayout>
    <Footer />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1 0 auto;
  padding: var(--page-padding-y) var(--page-padding-x);
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
}
</style>
