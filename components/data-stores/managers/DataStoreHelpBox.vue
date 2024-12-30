<script setup lang="ts">
const props = defineProps({
  helpField: String || null,
});

const selectedField = ref(props.helpField);

const panelSize = computed(() => {
  return selectedField ? {width: "60%"} : {width: "20%"};
});
</script>

<template>
  <div class="data-store-help">
    <Fieldset legend="selectedField" :toggleable="true">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </Fieldset>
  </div>
</template>

<style scoped lang="scss">
.data-store-help {
  width: v-bind(panelSize);
}
</style>
