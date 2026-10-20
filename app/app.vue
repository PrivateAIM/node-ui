<script lang="ts" setup>
import type { ToastMessageOptions } from "primevue/toast";

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
  <Toast position="top-right" :pt="toastPt" />
  <NuxtLoadingIndicator color="var(--p-primary-color)" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
