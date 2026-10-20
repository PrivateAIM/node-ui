<script lang="ts" setup>
import { computed, ref } from "vue";
import { DataStoreType } from "~/services/Api";
import { type AvailableProject, HelpTextField } from "~/types/dataStore";
import { useAvailableProjects } from "~/composables/useAvailableProjects";
import { useDataStoreForm } from "~/composables/useDataStoreForm";
import {
  ACCEPTED_PROTOCOLS,
  searchProjectsByName,
  sortProjectsByName,
} from "~/utils/data-store-form";
import { isValidDataStoreName } from "~/utils/data-store-name";

const props = defineProps<{ preselectedProjectId?: string }>();

const helpActive = ref<HelpTextField | undefined>();

const {
  loading,
  connMsg,
  selectedDataStoreType,
  selectedBucketAccessPolicy,
  bucketAccessKey,
  bucketSecretKey,
  selectedProject,
  selectedProjectOption,
  dataStoreName,
  host,
  path,
  port,
  protocol,
  rerollDataStoreName,
  preselectProject,
  autofillFields,
  submit: onSubmitCreateDataStoreAndProject,
} = useDataStoreForm();

const connMsgColor = computed(() =>
  connMsg.value === "Invalid connection!" ? "#ff2e2e" : "#008800",
);

const { availableProjects } = await useAvailableProjects();

const dataStoreTypeOptions = computed(() =>
  Object.values(DataStoreType).map((type) => ({
    label: type.toUpperCase(),
    value: type,
  })),
);

const sortedProjects = computed(() =>
  sortProjectsByName(availableProjects.value),
);

const projectSuggestions = ref<AvailableProject[]>([]);

// Show all projs if empty
function searchProjects(event: { query: string }) {
  projectSuggestions.value = searchProjectsByName(
    sortedProjects.value,
    event.query,
  );
}

preselectProject(availableProjects, props.preselectedProjectId);

function activateHelp(helpField: HelpTextField) {
  helpActive.value = helpActive.value === helpField ? undefined : helpField;
}

function deactivateHelp() {
  helpActive.value = undefined;
}
</script>

<template>
  <div class="ds-autofill-btns">
    <Button
      :loading="loading"
      :size="'small'"
      class="ds-autofill-btn"
      label="Autofill FHIR"
      outlined
      rounded
      severity="warn"
      @click="autofillFields(DataStoreType.Fhir, 'node-datastore-blaze', 80)"
    />
    <Button
      :loading="loading"
      :size="'small'"
      class="ds-autofill-btn"
      label="Autofill S3"
      outlined
      rounded
      severity="info"
      @click="
        autofillFields(
          DataStoreType.S3,
          'node-datastore-seaweedfs-all-in-one',
          8333,
        )
      "
    />
  </div>
  <div class="data-store-panel">
    <div class="data-store-input-fields">
      <InputGroup class="data-store-project-input" style="margin-bottom: 20px">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-pen-to-square"></i>
          <p class="data-store-field-name-box">Project</p>
        </InputGroupAddon>
        <AutoComplete
          v-model="selectedProject"
          :suggestions="projectSuggestions"
          class="project-picker"
          dropdown
          fluid
          forceSelection
          optionLabel="name"
          placeholder="Select or search for a project"
          @complete="searchProjects"
        />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-barcode"></i>
          <p
            v-tooltip.top="'Display name of the data store'"
            class="data-store-field-name-box"
          >
            Data Store
          </p>
        </InputGroupAddon>
        <InputText
          v-model="dataStoreName"
          :invalid="
            dataStoreName !== '' && !isValidDataStoreName(dataStoreName)
          "
          placeholder="Name of the data store"
        />
        <Button
          v-tooltip.top="'Suggest a new random name'"
          :disabled="!selectedProjectOption"
          class="reroll-name-btn"
          icon="pi pi-refresh"
          severity="secondary"
          @click="rerollDataStoreName"
        />
      </InputGroup>
      <InputGroup class="data-store-type-input">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-warehouse"></i>
          <div class="data-store-field-name-box">
            <button
              class="help-button"
              @click="activateHelp(HelpTextField.Type)"
            >
              <p
                v-tooltip.top="'Type of server the data is stored on'"
                class="help-text"
              >
                Server Type
              </p>
            </button>
          </div>
        </InputGroupAddon>
        <Select
          v-model="selectedDataStoreType"
          :options="dataStoreTypeOptions"
          class="data-store-type-picker"
          optionLabel="label"
          optionValue="value"
        />
      </InputGroup>
      <div
        v-if="selectedDataStoreType == DataStoreType.S3"
        class="s3-name-fields"
      >
        <InputGroup class="data-store-path-input-s3">
          <InputGroupAddon class="data-store-field-name">
            <i class="pi pi-inbox"></i>
            <div class="data-store-field-name-box">
              <button
                class="help-button"
                @click="activateHelp(HelpTextField.S3)"
              >
                <p v-tooltip.top="'Name of the S3 bucket'" class="help-text">
                  Bucket Name
                </p>
              </button>
            </div>
          </InputGroupAddon>
          <InputText
            v-model="path"
            :invalid="path === ''"
            placeholder="Name of the S3 bucket"
          />
        </InputGroup>
        <InputGroup class="data-store-path-input-s3-bucket">
          <InputGroupAddon class="data-store-field-name">
            <i class="pi pi-lock"></i>
            <div class="data-store-field-name-box">
              <p
                v-tooltip.top="'Whether the bucket is set to Public or Private'"
              >
                Bucket Access
              </p>
            </div>
          </InputGroupAddon>
          <InputGroupAddon class="data-store-field-value">
            <div class="flex flex-wrap gap-4 bucket-access-policy-radio">
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="selectedBucketAccessPolicy"
                  class="bucket-access-policy-radio-btn-private"
                  inputId="private"
                  name="accessPolicy"
                  size="small"
                  value="Private"
                />
                <label for="private">Private</label>
              </div>
              <div class="flex items-center gap-2">
                <RadioButton
                  v-model="selectedBucketAccessPolicy"
                  class="bucket-access-policy-radio-btn-public"
                  inputId="public"
                  name="accessPolicy"
                  size="small"
                  value="Public"
                />
                <label for="public">Public</label>
              </div>
            </div>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup
          v-if="selectedBucketAccessPolicy == 'Private'"
          class="data-store-path-input-s3-private"
        >
          <InputGroupAddon class="data-store-field-name">
            <i class="pi pi-verified"></i>
            <div class="data-store-field-name-box">
              <p v-tooltip.top="'Access key for the S3 bucket'">Access Key</p>
            </div>
          </InputGroupAddon>
          <InputText
            v-model="bucketAccessKey"
            :invalid="bucketAccessKey === ''"
            placeholder="Access key"
          />
        </InputGroup>
        <InputGroup
          v-if="selectedBucketAccessPolicy == 'Private'"
          class="data-store-path-input-s3-private"
        >
          <InputGroupAddon class="data-store-field-name">
            <i class="pi pi-key"></i>
            <div class="data-store-field-name-box">
              <p v-tooltip.top="'Secret key for the S3 instance'">Secret Key</p>
            </div>
          </InputGroupAddon>
          <InputText
            v-model="bucketSecretKey"
            :invalid="bucketSecretKey === ''"
            placeholder="Secret key"
          />
        </InputGroup>
      </div>
      <InputGroup v-else class="data-store-path-input-fhir">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-folder"></i>
          <div class="data-store-field-name-box">
            <button
              class="help-button"
              @click="activateHelp(HelpTextField.FHIR)"
            >
              <p v-tooltip.top="'Absolute directory path'" class="help-text">
                Data Path
              </p>
            </button>
          </div>
        </InputGroupAddon>
        <InputText
          v-model="path"
          :invalid="path === '' || !path.startsWith('/')"
          placeholder="Data path (must start with '/')"
        />
      </InputGroup>
      <InputGroup class="data-store-server-input">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-server"></i>
          <div class="data-store-field-name-box">
            <button
              class="help-button"
              @click="activateHelp(HelpTextField.Server)"
            >
              <p
                v-tooltip.top="'Name of the server on which the data resides'"
                class="help-text"
              >
                Hostname
              </p>
            </button>
          </div>
        </InputGroupAddon>
        <InputText
          v-model="host"
          :invalid="host === ''"
          placeholder="Server or hostname"
        />
      </InputGroup>
      <InputGroup class="data-store-port-input">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-bullseye"></i>
          <div class="data-store-field-name-box">
            <button
              class="help-button"
              @click="activateHelp(HelpTextField.Port)"
            >
              <p
                v-tooltip.top="'Port number for accessing the data'"
                class="help-text"
              >
                Port
              </p>
            </button>
          </div>
        </InputGroupAddon>
        <InputNumber
          v-model="port"
          :invalid="port < 0 || port > 65535"
          :useGrouping="false"
          placeholder="Port e.g. 443"
        />
      </InputGroup>
      <InputGroup class="data-store-protocol-input">
        <InputGroupAddon class="data-store-field-name">
          <i class="pi pi-cog"></i>
          <div class="data-store-field-name-box">
            <button
              class="help-button"
              @click="activateHelp(HelpTextField.Protocol)"
            >
              <p
                v-tooltip.top="'Access protocol for the data storage server'"
                class="help-text"
              >
                Protocol
              </p>
            </button>
          </div>
        </InputGroupAddon>
        <Select
          v-model="protocol"
          :options="ACCEPTED_PROTOCOLS"
          class="w-full md:w-56 communication-protocol-picker"
        />
      </InputGroup>
      <div class="data-store-submission-container">
        <Button
          :loading="loading"
          class="create-data-store-btn"
          icon="pi pi-check"
          iconPos="right"
          label="Submit"
          severity="info"
          @click="onSubmitCreateDataStoreAndProject"
        />
        <div v-if="connMsg" class="data-store-connection-test-text">
          <p>
            {{ connMsg }}
          </p>
        </div>
      </div>
    </div>
    <div v-if="helpActive" class="data-store-help-box">
      <DataStoreHelpBox :helpField="helpActive" @closeHelp="deactivateHelp" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-store-help-box {
  width: 60%;
}

.data-store-panel {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
}

.ds-autofill-btns {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.data-store-input-fields {
  width: 80%;
  margin-right: 24px;
}

.data-store-field-name-box {
  margin-left: 10px;
}

.p-inputgroupaddon {
  color: var(--p-card-color);
}

.data-store-field-name {
  width: 200px;
  height: 50px;
}

.help-button {
  background: inherit;
  border: inherit;
  font: inherit;
  color: inherit;
}

.help-text {
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
  cursor: help;
}

.data-store-submission-container {
  display: flex;
  align-items: center;
  margin-top: 1em;
}

.data-store-connection-test-text {
  font-weight: bold;
  margin-left: 1.2em;
  color: v-bind(connMsgColor);
  margin-block-start: 0;
  margin-block-end: 0;
}

.bucket-access-policy-radio {
  margin-left: 1.2em;
}

.data-store-field-value {
  flex: 1 1 auto;
  justify-content: flex-start;
}
</style>
