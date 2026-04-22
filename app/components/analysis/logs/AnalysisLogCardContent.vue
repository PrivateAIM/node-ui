<script lang="ts" setup>
import { Card, ScrollPanel } from "primevue";
import { computed, onMounted, onUpdated, ref } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import type { PodLog } from "~/services/Api";

const props = defineProps<{
  nginxLogs?: PodLog[];
  analysisLogs?: PodLog[];
}>();
const nginxLogBottom = ref();
const analysisLogBottom = ref();
const showTimestamps = ref(false);

const toast = useToast();

const scrollToBottom = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

onMounted(() => {
  scrollToBottom(nginxLogBottom.value);
  scrollToBottom(analysisLogBottom.value);
});

onUpdated(() => {
  scrollToBottom(nginxLogBottom.value);
  scrollToBottom(analysisLogBottom.value);
});

function formatLogs(logs: PodLog[] | undefined, timestamps: boolean): string {
  if (!logs?.length) return "";
  return logs
    .map((entry) => (timestamps ? `${entry.timestamp}  ${entry.message}` : entry.message))
    .join("\n");
}

const formattedNginxLogs = computed(() =>
  formatLogs(props.nginxLogs, showTimestamps.value),
);
const formattedAnalysisLogs = computed(() =>
  formatLogs(props.analysisLogs, showTimestamps.value),
);

const downloadLogs = (analysisLogs: boolean) => {
  const prefix = analysisLogs ? "analysis" : "nginx";
  const filename = `${prefix}-logs-${Date.now()}`;
  const logs = analysisLogs ? formattedAnalysisLogs.value : formattedNginxLogs.value;

  if (logs) {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const copyToClipboard = async (analysisLogs: boolean) => {
  const logs = analysisLogs ? formattedAnalysisLogs.value : formattedNginxLogs.value;
  if (logs) {
    try {
      await navigator.clipboard.writeText(logs);
      toast.add({
        severity: "contrast",
        summary: "Copied to clipboard!",
        life: 3000,
        group: "copiedLogs",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
};
</script>

<template>
  <Toast group="copiedLogs" position="top-center" class="copy-toast" />
  <div class="log-content-toolbar">
    <ToggleButton
      v-model="showTimestamps"
      onLabel="Timestamps On"
      offLabel="Timestamps Off"
      onIcon="pi pi-clock"
      offIcon="pi pi-clock"
      class="log-timestamp-toggle"
    />
  </div>
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="log-header-row">
          <div class="log-header-row-title">Nginx Logs</div>
          <div class="log-btns" v-if="formattedNginxLogs">
            <div class="log-download-btn log-btn">
              <Button
                icon="pi pi-download"
                @click="downloadLogs(false)"
                severity="contrast"
                variant="text"
                v-tooltip.top="'Download logs'"
              />
            </div>
            <div class="log-copy-btn log-btn">
              <Button
                icon="pi pi-copy"
                @click="copyToClipboard(false)"
                severity="contrast"
                variant="text"
                v-tooltip.top="'Copy logs to clipboard'"
              />
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="card nginx-log-content">
          <ScrollPanel class="log-scroll-panel">
            <span v-if="formattedNginxLogs">
              {{ formattedNginxLogs }}
            </span>
            <span v-else>No logs found...</span>
            <div ref="nginxLogBottom"></div>
          </ScrollPanel>
        </div>
      </template>
    </Card>
    <Card class="log-card analysis-log-card">
      <template #title>
        <div class="log-header-row">
          <div class="log-header-row-title">Analysis Logs</div>
          <div class="log-btns" v-if="formattedAnalysisLogs">
            <div class="log-download-btn log-btn">
              <Button
                icon="pi pi-download"
                @click="downloadLogs(true)"
                severity="contrast"
                variant="text"
                v-tooltip.top="'Download logs'"
              />
            </div>
            <div class="log-copy-btn log-btn">
              <Button
                icon="pi pi-copy"
                @click="copyToClipboard(true)"
                severity="contrast"
                variant="text"
                v-tooltip.top="'Copy logs to clipboard'"
              />
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <ScrollPanel class="log-scroll-panel">
          <span v-if="formattedAnalysisLogs">
            {{ formattedAnalysisLogs }}
          </span>
          <span v-else>No logs found...</span>
          <div ref="analysisLogBottom"></div>
        </ScrollPanel>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
.log-content-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5em;
}

.log-timestamp-toggle {
  font-size: 0.8em;
}

.analysis-logs {
  display: flex;
  justify-content: space-between;
}

.log-card {
  border: 1px solid grey;
  height: 50%;
  background: var(--p-slate-800);
  color: #f1f5f9;
}

.nginx-log-card {
  margin-right: 1em;
  width: 50%;
}

.analysis-log-card {
  width: 50%;
}

.log-scroll-panel {
  font-family: Roboto Mono Regular,
  monospace;
  font-size: 0.8em;
  height: 30em;
  padding: 1em;
  white-space: pre-wrap;
  word-break: break-word;
}

.flame-dark .log-scroll-panel {
  background: #000;
  color: #e2e8f0;
  border-top: white solid 1px;
}

.log-header-row {
  display: flex;
  align-items: center;
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
  padding: 0.5em;
  border-radius: 6px;
}

.log-btns {
  display: flex;
  margin-left: auto;
}

.log-btn {
  padding-left: 0.2em;
}

.analysis-logs .p-card-body {
  padding: 0;
}

.p-card-title {
  margin-bottom: 0 !important;
}

.log-card .p-card-body {
  gap: 0;
}

.log-card {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.copy-toast {
  padding: 0;
  width: auto;
  border-width: 0;
}
</style>
