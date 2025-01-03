<script setup lang="ts">
import { HelpTextField } from "~/components/data-stores/managers/index";

const props = defineProps({
  helpField: String || null,
});
</script>

<template>
  <div class="data-store-help">
    <Fieldset :legend="props.helpField" :toggleable="false">
      <p v-if="props.helpField === HelpTextField.Methods">Methods</p>
      <p v-else-if="props.helpField === HelpTextField.Path">Path</p>
      <p v-else-if="props.helpField === HelpTextField.Port">Port</p>
      <p v-else-if="props.helpField === HelpTextField.Protocol">Protocol</p>
      <p v-else-if="props.helpField === HelpTextField.Server">Server</p>
      <p v-else-if="props.helpField === HelpTextField.Type">Type</p>
      <p v-else>Foobar</p>
    </Fieldset>
  </div>
</template>

<style scoped lang="scss"></style>
