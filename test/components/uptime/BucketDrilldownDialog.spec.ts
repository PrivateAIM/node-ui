import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import BucketDrilldownDialog from "~/components/uptime/BucketDrilldownDialog.vue";
import { buildSlots, type UptimeSlot } from "~/composables/useServiceHealth";
import { formatClockTime, SLOW_LATENCY_MS } from "~/utils/uptime-state";
import { ServiceCheckStatus, type ServiceHealthPoint } from "~/services/Api";

// Mocking the module replaces it wholesale, so every other export becomes undefined
// inside this file. That is fine while the component imports only this one function -
// and it is why the component imports it explicitly: a call reaching the composable
// through Nuxt's auto-import would not be intercepted by a mock keyed to this path.
const mockFetch = vi.fn();

vi.mock("~/composables/useAPIFetch", () => ({
  getServiceHealthHistory: (...args: unknown[]) => mockFetch(...args),
}));

/** The subset of the query the dialog is responsible for building. */
interface HistoryQuery {
  start_date?: string;
  end_date?: string;
  service?: string[];
  include_checks?: boolean;
  resolution?: number;
}

// Three five-minute slices, the same shape the track hands over.
const slots = buildSlots(
  new Date("2026-07-30T12:00:00Z"),
  new Date("2026-07-30T12:15:00Z"),
  300,
);

function check(
  overrides: Partial<ServiceHealthPoint> = {},
): ServiceHealthPoint {
  return {
    checked_at: "2026-07-30T12:01:00Z",
    status: ServiceCheckStatus.OK,
    status_code: 200,
    latency_ms: 42,
    message: null,
    sweep_id: null,
    ...overrides,
  };
}

/** The adapter's shape: checks live under the service key that was asked for. */
function respondWith(checks: ServiceHealthPoint[], service = "kong") {
  mockFetch.mockResolvedValue({
    data: { value: { services: { [service]: { checks } } } },
  });
}

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(BucketDrilldownDialog, {
    props: {
      visible: true,
      service: "kong",
      slotRange: slots[0]!,
      slots,
      ...props,
    },
    // Not a component stub: PrimeVue's Dialog teleports its body to document.body, so
    // its content would never appear in the wrapper. Stubbing Vue's own Teleport keeps
    // the REAL Dialog, DataTable and Buttons mounted and renders them in place.
    global: { stubs: { teleport: true } },
  });
}

type DialogWrapper = ReturnType<typeof mountDialog>;

async function mountOpen(props: Record<string, unknown> = {}) {
  const wrapper = mountDialog(props);
  await flushPromises();

  return wrapper;
}

function lastQuery(): HistoryQuery {
  const calls = mockFetch.mock.calls;

  return calls[calls.length - 1]![0] as HistoryQuery;
}

/**
 * Every rendered probe row, as its cell texts. DataTable renders its `#empty` template
 * as a row of its own, which is not a probe and must not be counted as one.
 */
function rows(wrapper: DialogWrapper): string[][] {
  return wrapper
    .findAll("tbody tr:not(.p-datatable-empty-message)")
    .map((row) => row.findAll("td").map((cell) => cell.text()));
}

function stepped(wrapper: DialogWrapper): UptimeSlot[] {
  const emitted = wrapper.emitted("update:slotRange") as
    | [UptimeSlot][]
    | undefined;

  return (emitted ?? []).map(([slot]) => slot);
}

/** Emulates the parent half of `v-model:slotRange`, which VTU does not wire up. */
async function applyStep(wrapper: DialogWrapper) {
  const all = stepped(wrapper);

  await wrapper.setProps({ slotRange: all[all.length - 1] });
  await flushPromises();
}

describe("BucketDrilldownDialog.vue", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    respondWith([]);
  });

  describe("fetching", () => {
    it("requests raw checks for only the clicked service and slice", async () => {
      await mountOpen();

      const query = lastQuery();
      expect(query.service).toEqual(["kong"]);
      expect(query.include_checks).toBe(true);
      // A resolution would return aggregates; this dialog exists to show the probes
      // the aggregate was computed from.
      expect(query.resolution).toBeUndefined();
      expect(query.start_date).toBe(slots[0]!.start.toISOString());
      expect(query.end_date).toBe(slots[0]!.end.toISOString());
    });

    it("does not fetch while hidden", async () => {
      await mountOpen({ visible: false });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("fetches when it is opened, not when it is built", async () => {
      const wrapper = await mountOpen({ visible: false });

      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("does not fetch without a slice to fetch", async () => {
      await mountOpen({ slotRange: null });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("does not fetch without a service to fetch it for", async () => {
      await mountOpen({ service: null });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("the probe list", () => {
    it("shows the message the hub adapter returned for a failing check", async () => {
      respondWith([
        check({
          status: ServiceCheckStatus.ERROR,
          status_code: 503,
          latency_ms: 1204,
          message: "Connection refused",
        }),
      ]);

      const wrapper = await mountOpen();

      // The whole point of the drill-down: a cell says something failed, this says why.
      expect(wrapper.text()).toContain("Connection refused");
    });

    it("marks a check slower than the threshold, the only place a single slow probe is named", async () => {
      respondWith([check({ latency_ms: SLOW_LATENCY_MS + 1 })]);

      const wrapper = await mountOpen();

      // The track colours a whole slice by its worst check, so an individual slow probe
      // is invisible until here. Asserted against the shared constant rather than a
      // literal so the table and the track can never disagree about "slow".
      expect(wrapper.find(".bucket-drilldown-slow").exists()).toBe(true);
    });

    it("leaves a check at the threshold unmarked, so 'slow' means strictly over it", async () => {
      respondWith([check({ latency_ms: SLOW_LATENCY_MS })]);

      const wrapper = await mountOpen();

      expect(wrapper.find(".bucket-drilldown-slow").exists()).toBe(false);
    });

    it("does not mark a check whose latency the adapter did not record", async () => {
      respondWith([check({ latency_ms: null })]);

      const wrapper = await mountOpen();

      // A missing latency is unknown, not fast and not slow.
      expect(wrapper.find(".bucket-drilldown-slow").exists()).toBe(false);

      // And it reads as a hyphen rather than a blank cell, matching how the card
      // renders an unknown uptime - a blank would look like a rendering fault.
      expect(rows(wrapper)[0]).toContain("-");
    });

    it("shows the status code and latency of each probe", async () => {
      respondWith([
        check({
          status: ServiceCheckStatus.ERROR,
          status_code: 503,
          latency_ms: 1204,
          message: "Connection refused",
        }),
      ]);

      const wrapper = await mountOpen();
      const [row] = rows(wrapper);

      expect(row).toContain("503");
      expect(row).toContain("1204");
    });

    it("marks a failed probe differently from a successful one", async () => {
      respondWith([
        check({ checked_at: "2026-07-30T12:01:00Z" }),
        check({
          checked_at: "2026-07-30T12:01:30Z",
          status: ServiceCheckStatus.ERROR,
          message: "Connection refused",
        }),
      ]);

      const wrapper = await mountOpen();
      const tags = wrapper.findAll(".p-tag");

      expect(tags).toHaveLength(2);
      expect(tags[0]!.classes()).toContain("p-tag-success");
      expect(tags[1]!.classes()).toContain("p-tag-danger");
    });

    it("distinguishes probes made in the same minute", async () => {
      respondWith([
        check({ checked_at: "2026-07-30T12:01:00Z" }),
        check({ checked_at: "2026-07-30T12:01:30Z" }),
      ]);

      const wrapper = await mountOpen();
      const [first, second] = rows(wrapper);

      // The load-bearing one: the node probes every 30s at the finest resolution, so a
      // format without seconds renders two distinct probes as identical rows.
      expect(first![0]).not.toBe(second![0]);
      // Pins the chosen format. Compared against the same formatter rather than a
      // literal, so the suite does not depend on the runner's locale or timezone.
      expect(first![0]).toBe(
        new Date("2026-07-30T12:01:00Z").toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "medium",
        }),
      );
    });

    it("says a slice recorded nothing rather than showing an empty table", async () => {
      respondWith([]);

      const wrapper = await mountOpen();

      // Stepping deliberately lands on empty slices, so this is a state the reader
      // reaches often - an empty table alone reads as a failure to load.
      expect(rows(wrapper)).toHaveLength(0);
      expect(wrapper.text()).toContain("No checks recorded in this window");
    });

    it("names the service it is showing", async () => {
      const wrapper = await mountOpen();

      expect(wrapper.text()).toContain("kong");
    });

    it("names the slice it is showing, and its place in the range", async () => {
      const wrapper = await mountOpen({ slotRange: slots[1]! });
      const window = wrapper.get("[data-testid='uptime-drilldown-window']");

      expect(window.text()).toContain(
        `${formatClockTime(slots[1]!.start)}–${formatClockTime(slots[1]!.end)}`,
      );
      expect(window.text()).toContain("2 of 3");
      // Stepping swaps the table out underneath a keyboard reader with no other
      // signal that anything moved.
      expect(window.attributes("aria-live")).toBe("polite");
    });

    it("asks to be closed when the dialog is dismissed", async () => {
      const wrapper = await mountOpen();

      await wrapper.get(".p-dialog-close-button").trigger("click");

      expect(wrapper.emitted("update:visible")).toEqual([[false]]);
    });
  });

  describe("stepping between slices", () => {
    it("steps forward onto the adjacent slice", async () => {
      const wrapper = await mountOpen({ slotRange: slots[0]! });

      await wrapper
        .get("[data-testid='uptime-drilldown-next']")
        .trigger("click");

      expect(stepped(wrapper)).toEqual([slots[1]]);
    });

    it("steps back onto the adjacent slice", async () => {
      const wrapper = await mountOpen({ slotRange: slots[1]! });

      await wrapper
        .get("[data-testid='uptime-drilldown-prev']")
        .trigger("click");

      expect(stepped(wrapper)).toEqual([slots[0]]);
    });

    it("cannot step back from the first slice", async () => {
      const wrapper = await mountOpen({ slotRange: slots[0]! });

      expect(
        wrapper
          .get("[data-testid='uptime-drilldown-prev']")
          .attributes("disabled"),
      ).toBeDefined();
      expect(
        wrapper
          .get("[data-testid='uptime-drilldown-next']")
          .attributes("disabled"),
      ).toBeUndefined();
    });

    it("cannot step forward from the last slice", async () => {
      const wrapper = await mountOpen({ slotRange: slots[slots.length - 1]! });

      expect(
        wrapper
          .get("[data-testid='uptime-drilldown-next']")
          .attributes("disabled"),
      ).toBeDefined();
      expect(
        wrapper
          .get("[data-testid='uptime-drilldown-prev']")
          .attributes("disabled"),
      ).toBeUndefined();
    });

    it("offers no stepping for a slice that is not in the range", async () => {
      const wrapper = await mountOpen({
        slotRange: {
          start: new Date("2026-07-30T20:00:00Z"),
          end: new Date("2026-07-30T20:05:00Z"),
        },
      });

      for (const control of ["prev", "next"]) {
        expect(
          wrapper
            .get(`[data-testid='uptime-drilldown-${control}']`)
            .attributes("disabled"),
        ).toBeDefined();
      }
    });

    it("finds its place by timestamp, not by object identity", async () => {
      // The slot objects are rebuilt on every range change, so the slice the page is
      // holding is never the same object as the one in the list.
      const rebuilt: UptimeSlot = {
        start: new Date(slots[1]!.start.getTime()),
        end: new Date(slots[1]!.end.getTime()),
      };
      const wrapper = await mountOpen({ slotRange: rebuilt });

      await wrapper
        .get("[data-testid='uptime-drilldown-next']")
        .trigger("click");

      expect(stepped(wrapper)).toEqual([slots[2]]);
    });

    it("refetches exactly once for the window it stepped onto", async () => {
      const wrapper = await mountOpen({ slotRange: slots[0]! });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await wrapper
        .get("[data-testid='uptime-drilldown-next']")
        .trigger("click");
      await applyStep(wrapper);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(lastQuery().start_date).toBe(slots[1]!.start.toISOString());
      expect(lastQuery().end_date).toBe(slots[1]!.end.toISOString());
    });

    it("steps onto a slice that recorded nothing instead of skipping it", async () => {
      respondWith([]);
      const wrapper = await mountOpen({ slotRange: slots[0]! });

      await wrapper
        .get("[data-testid='uptime-drilldown-next']")
        .trigger("click");
      await applyStep(wrapper);

      // Skipping empty slices would make the dialog disagree with the track a sighted
      // reader is looking at; an empty slice has an answer of its own.
      expect(stepped(wrapper)).toEqual([slots[1]]);
      expect(wrapper.text()).toContain("No checks recorded in this window");
    });

    it("ignores a response for a slice the reader has already stepped off", async () => {
      const pending: ((value: unknown) => void)[] = [];
      mockFetch.mockImplementation(
        () => new Promise((resolve) => pending.push(resolve)),
      );

      const wrapper = mountDialog({ slotRange: slots[0]! });
      await flushPromises();

      await wrapper.setProps({ slotRange: slots[1]! });
      await flushPromises();

      const body = (message: string) => ({
        data: {
          value: { services: { kong: { checks: [check({ message })] } } },
        },
      });

      // The second window answers first, the abandoned one afterwards.
      pending[1]!(body("second window"));
      await flushPromises();
      pending[0]!(body("first window"));
      await flushPromises();

      expect(wrapper.text()).toContain("second window");
      expect(wrapper.text()).not.toContain("first window");
    });
  });
});
