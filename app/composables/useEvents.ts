import { computed, ref } from "vue";
import { useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import type { EventLog, EventLogResponse, Meta } from "~/services/Api";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 16);
}

/** Fetches the node event log in pages, within an optional date window. */
export function useEvents() {
  const toast = useToast();

  const fetchLimit = ref(50);
  const events = ref<EventLog[]>([]);
  const meta = ref<Meta>({
    count: 0,
    total: 0,
    limit: fetchLimit.value,
    offset: 0,
  });
  const loading = ref(false);

  const startDate = ref<Date>();
  const endDate = ref<Date>();

  const allLoaded = computed(() => events.value.length >= meta.value.total);

  function buildQuery(offset: number) {
    return {
      limit: fetchLimit.value,
      offset,
      ...(startDate.value && { start_date: formatDate(startDate.value) }),
      ...(endDate.value && { end_date: formatDate(endDate.value) }),
    };
  }

  async function fetchEvents(offset: number, reset: boolean) {
    loading.value = true;
    const resp = (await useNuxtApp()
      .$hubApi("/events", {
        method: "GET",
        query: buildQuery(offset),
      })
      .catch((e) => {
        if (e?.status === 503) {
          toast.add({
            severity: "error",
            summary: "Event Log Unavailable",
            detail: "The event log service is not configured on this node",
            life: 5000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: "Event Fetch Failed",
            detail: "Unable to fetch events from the server",
            life: 5000,
          });
        }
        return undefined;
      })) as EventLogResponse | undefined;

    if (resp) {
      events.value = reset ? resp.data : [...events.value, ...resp.data];
      meta.value = resp.meta;
    }

    loading.value = false;
  }

  function onPage(event: { page: number; rows: number }) {
    if (allLoaded.value) return;

    const loadedPages = Math.ceil(events.value.length / event.rows);
    const currentPage = event.page + 1;

    if (currentPage >= loadedPages - 1) {
      fetchEvents(events.value.length, false);
    }
  }

  function applyDateFilter(
    start: Date | undefined,
    end: Date | undefined,
    limit: number,
  ) {
    startDate.value = start;
    endDate.value = end;
    fetchLimit.value = limit;
    fetchEvents(0, true);
  }

  return { events, loading, onPage, applyDateFilter };
}
