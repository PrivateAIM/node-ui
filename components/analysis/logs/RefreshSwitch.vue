<script setup lang="ts">
const periodicRefresh = ref(false);
</script>

<template>
  <div class="justify-content-center log-toggle-switch">
    <span style="font-size: 12px; padding-right: 0.5em">
      Refresh periodically
    </span>
    <InputSwitch
      v-model="periodicRefresh"
      v-tooltip.top="'Refresh logs every 5 seconds'"
    />
  </div>
</template>

<style scoped lang="scss"></style>
