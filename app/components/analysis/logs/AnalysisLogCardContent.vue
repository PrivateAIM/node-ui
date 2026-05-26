<script lang="ts" setup>
import { Card, VirtualScroller } from "primevue";
import { nextTick, onMounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import type { FlatLogLine } from "~/types/logs";

const props = defineProps<{
  nginxLines: FlatLogLine[];
  analysisLines: FlatLogLine[];
  showTimestamps?: boolean;
  nginxHasOlder?: boolean;
  analysisHasOlder?: boolean;
  nginxLoading?: boolean;
  analysisLoading?: boolean;
  onLoadOlderNginx?: () => Promise<void>;
  onLoadOlderAnalysis?: () => Promise<void>;
}>();

const toast = useToast();

function isNearBottom(el: HTMLElement): boolean {
  return el.scrollTop >= el.scrollHeight - el.clientHeight - 50;
}

function createScrollState(
  getLines: () => FlatLogLine[],
  getHasOlder: () => boolean | undefined,
  getLoading: () => boolean | undefined,
  getLoadFn: () => (() => Promise<void>) | undefined,
) {
  const scrollerRef = ref<{ $el: HTMLElement } | null>(null);
  let atBottom = false;

  onMounted(async () => {
    await nextTick();
    const el = scrollerRef.value?.$el;
    if (el && getLines().length > 0) {
      el.scrollTop = el.scrollHeight;
      atBottom = true;
    }
  });

  // Auto-scroll on polling appends; prepends have a different first-item timestamp
  watch(
    getLines,
    (newLines, oldLines) => {
      if (!oldLines || newLines.length <= oldLines.length) return;
      if (newLines[0]?.timestamp === oldLines[0]?.timestamp && atBottom) {
        nextTick().then(() => {
          const el = scrollerRef.value?.$el;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    },
    { flush: "post" },
  );

  async function loadOlder() {
    const loadFn = getLoadFn();
    if (!loadFn || getLoading()) return;
    const el = scrollerRef.value?.$el as HTMLElement | null;
    const prevScrollHeight = el?.scrollHeight ?? 0;
    const prevScrollTop = el?.scrollTop ?? 0;
    await loadFn();
    await nextTick();
    if (el) el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight);
  }

  function onScroll(e: Event) {
    const el = e.target as HTMLElement;
    atBottom = isNearBottom(el);
    if (el.scrollTop <= 50 && getHasOlder() && !getLoading()) {
      loadOlder();
    }
  }

  return { scrollerRef, onScroll };
}

const { scrollerRef: nginxScrollerRef, onScroll: onNginxScroll } =
  createScrollState(
    () => props.nginxLines,
    () => props.nginxHasOlder,
    () => props.nginxLoading,
    () => props.onLoadOlderNginx,
  );

const { scrollerRef: analysisScrollerRef, onScroll: onAnalysisScroll } =
  createScrollState(
    () => props.analysisLines,
    () => props.analysisHasOlder,
    () => props.analysisLoading,
    () => props.onLoadOlderAnalysis,
  );

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    ` ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

function logLevelClass(level?: string | null): string {
  switch (level?.toUpperCase()) {
    case "ERROR":
    case "CRITICAL":
    case "FATAL":
      return "log-level-error";
    case "WARN":
    case "WARNING":
      return "log-level-warn";
    case "INFO":
      return "log-level-info";
    case "DEBUG":
    case "TRACE":
      return "log-level-debug";
    default:
      return "log-level-default";
  }
}

function formatFlatLines(lines: FlatLogLine[]): string {
  return lines
    .map((line) => {
      const prefix = props.showTimestamps
        ? `${formatTimestamp(line.timestamp)}  `
        : "";
      const indent = line.isStacktrace ? "  " : "";
      return `${prefix}${indent}${line.content}`;
    })
    .join("\n");
}

function downloadLogs(isAnalysis: boolean) {
  const prefix = isAnalysis ? "analysis" : "nginx";
  const filename = `${prefix}-logs-${Date.now()}`;
  const logs = formatFlatLines(
    isAnalysis ? props.analysisLines : props.nginxLines,
  );
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
}

async function copyToClipboard(isAnalysis: boolean) {
  const logs = formatFlatLines(
    isAnalysis ? props.analysisLines : props.nginxLines,
  );
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
}


</script>

<template>
  <Toast group="copiedLogs" position="top-center" class="copy-toast" />
  <div class="card analysis-logs">
    <Card class="log-card nginx-log-card">
      <template #title>
        <div class="log-header-row">
          <div class="log-header-row-title">Nginx Logs</div>
          <div class="log-btns" v-if="nginxLines.length">
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
          <VirtualScroller
            v-if="nginxLines.length"
            ref="nginxScrollerRef"
            :items="nginxLines"
            :itemSize="20"
            style="height: 30em"
            class="log-scroll-panel"
            @scroll="onNginxScroll"
          >
            <template #item="{ item }: { item: FlatLogLine }">
              <div class="log-entry">
                <span v-if="showTimestamps" class="log-timestamp">
                  {{ formatTimestamp(item.timestamp) }}&nbsp;&nbsp;
                </span>
                <span
                  :class="
                    item.isStacktrace
                      ? 'log-stacktrace-line'
                      : ['log-message', logLevelClass(item.level)]
                  "
                  >{{ item.content }}</span
                >
              </div>
            </template>
          </VirtualScroller>
          <span v-else>No logs found...</span>
        </div>
      </template>
    </Card>
    <Card class="log-card analysis-log-card">
      <template #title>
        <div class="log-header-row">
          <div class="log-header-row-title">Analysis Logs</div>
          <div class="log-btns" v-if="analysisLines.length">
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
        <VirtualScroller
          v-if="analysisLines.length"
          ref="analysisScrollerRef"
          :items="analysisLines"
          :itemSize="20"
          style="height: 30em"
          class="log-scroll-panel"
          @scroll="onAnalysisScroll"
        >
          <template #item="{ item }: { item: FlatLogLine }">
            <div class="log-entry">
              <span v-if="showTimestamps" class="log-timestamp">
                {{ formatTimestamp(item.timestamp) }}&nbsp;&nbsp;
              </span>
              <span
                :class="
                  item.isStacktrace
                    ? 'log-stacktrace-line'
                    : ['log-message', logLevelClass(item.level)]
                "
                >{{ item.content }}</span
              >
            </div>
          </template>
        </VirtualScroller>
        <span v-else>No logs found...</span>
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
  font-family:
    Roboto Mono Regular,
    monospace;
  font-size: 0.8em;
  height: 30em;
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

.log-entry {
  height: 20px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  overflow: hidden;
}

.log-message {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-timestamp {
  opacity: 0.7;
  flex-shrink: 0;
}

.log-level-error {
  color: #f87171;
}

.log-level-warn {
  color: #fbbf24;
}

.log-level-info {
  color: #38bdf8;
}

.log-level-debug {
  color: #a3e635;
}

.log-level-default {
  color: #e2e8f0;
}

.log-stacktrace-line {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fca5a5;
  border-left: 2px solid #f87171;
  padding-left: 0.5em;
}
</style>
