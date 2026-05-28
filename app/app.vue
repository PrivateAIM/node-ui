<script setup lang="ts">
import MenuHeader from "~/components/header/MenuHeader.vue";
import Footer from "~/components/Footer.vue";
</script>

<template>
  <Toast position="top-right" />
  <NuxtLoadingIndicator color="var(--p-primary-color)" />
  <MenuHeader />
  <NuxtLayout>
    <main class="page-content">
      <NuxtPage />
    </main>
  </NuxtLayout>
  <Footer />
</template>

<style>
.page-content {
  padding: var(--page-padding-y) var(--page-padding-x);
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
}
</style>
