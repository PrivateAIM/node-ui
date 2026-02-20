<script lang="ts" setup>
import { Card, ScrollPanel } from "primevue";
import { onMounted, onUpdated, ref } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

const props = defineProps<{
  nginxLogs?: string;
  analysisLogs?: string;
}>();
const nginxLogBottom = ref();
const analysisLogBottom = ref();

const toast = useToast();

const scrollToBottom = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

onMounted(() => {
  scrollToBottom(nginxLogBottom.value);
  scrollToBottom(analysisLogBottom.value);
});

onUpdated(() => {
  // When refresh is toggled on
  scrollToBottom(nginxLogBottom.value);
  scrollToBottom(analysisLogBottom.value);
});

const downloadLogs = (analysisLogs: boolean) => {
  const prefix = analysisLogs ? "analysis" : "nginx";
  const filename = `${prefix}-logs-${Date.now()}`;
  const logs = analysisLogs ? props.analysisLogs : props.nginxLogs;

  if (logs) {
    const blob = new Blob([logs], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Remove temp DOM components
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const copyToClipboard = async (analysisLogs: boolean) => {
  const logs = analysisLogs ? props.analysisLogs : props.nginxLogs;
  if (logs) {
    try {
      await navigator.clipboard.writeText(logs);
      toast.add({
        severity: "contrast",
        summary: "Copied to clipboard!",
        life: 3000,
        group: "copiedLogs"
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
};
</script>

<template>
  <Toast group="copiedLogs" position="top-center" class="copy-toast" />
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="log-header-row">
          <div class="log-header-row-title">Nginx Logs</div>
          <div class="log-btns" v-if="props.nginxLogs">
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
        <div class="card foo-card">
          <ScrollPanel class="log-scroll-panel">
            <span v-if="props.nginxLogs">
              {{ props.nginxLogs }}
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
          <div class="log-btns" v-if="props.analysisLogs">
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
          <span v-if="props.analysisLogs">
            {{ props.analysisLogs }}
          </span>
          <span v-else>No logs found...</span>
          <div ref="analysisLogBottom"></div>
        </ScrollPanel>
      </template>
    </Card>
  </div>
</template>

<style lang="scss">
.analysis-logs {
  display: flex;
  justify-content: space-between;
}

.log-card {
  border: 1px solid grey;
  height: 50%;
  background: var(--p-slate-800);
}

.nginx-log-card {
  margin-right: 1em;
  width: 50%;
}

.analysis-log-card {
  width: 50%;
}

.log-scroll-panel {
  background: #000;
  font-family: Roboto Mono Regular,
  monospace;
  font-size: 0.8em;
  height: 30em;
  padding: 1em;
  white-space: pre-wrap;
  word-break: break-word;
  border-top: white solid 1px;
}

.log-header-row {
  display: flex;
  align-items: center;
  background: var(--p-highlight-background);
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
