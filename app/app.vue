<script setup lang="ts">
import MenuHeader from "~/components/header/MenuHeader.vue";
import Footer from "~/components/Footer.vue";
</script>

<template>
  <Toast position="top-right" />
  <NuxtLoadingIndicator />
  <MenuHeader />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Footer />
</template>

<style lang="scss"></style>
