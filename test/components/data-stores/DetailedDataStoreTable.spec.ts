import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import DetailedDataStoreTable from "~/components/data-stores/DetailedDataStoreTable.vue";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import { fakeDataStoreResp, validProjectId } from "./constants";

const mockDelete = vi.fn();

vi.mock("~/composables/useAPIFetch", () => ({
  deleteDataStore: (...args: unknown[]) => mockDelete(...args),
}));

const stores = fakeDataStoreResp.data as ModifiedDetailedService[];
const store = stores[0]!;

describe("DetailedDataStoreTable.vue", () => {
  let toastAdd: ReturnType<typeof vi.fn>;
  let confirmOptions: { accept?: () => void };

  beforeEach(() => {
    mockDelete.mockReset();
    mockDelete.mockResolvedValue(undefined);

    toastAdd = vi.fn();
    vi.mocked(useToast).mockReturnValue({ add: toastAdd });

    confirmOptions = {};
    vi.mocked(useConfirm).mockReturnValue({
      require: (options: { accept?: () => void }) => {
        confirmOptions = options;
      },
    });
  });

  function mountTable() {
    return mount(DetailedDataStoreTable, {
      props: {
        stores,
        projectNameMap: new Map([[validProjectId, "A project"]]),
        loading: false,
      },
    });
  }

  async function confirmDelete() {
    const wrapper = mountTable();

    await wrapper.get("button[aria-label='Delete']").trigger("click");
    confirmOptions.accept?.();
    await flushPromises();

    return wrapper;
  }

  it("deletes the chosen store, cascading to its project links", async () => {
    await confirmDelete();

    expect(mockDelete).toHaveBeenCalledWith(store.id, true);
  });

  it("does not delete anything until the confirmation is accepted", async () => {
    const wrapper = mountTable();

    await wrapper.get("button[aria-label='Delete']").trigger("click");
    await flushPromises();

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("tells the list to drop the row once the store is gone", async () => {
    const wrapper = await confirmDelete();

    expect(wrapper.emitted("deleteDataStore")).toEqual([[store.id]]);
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "success" }),
    );
  });

  it("keeps the row when the delete fails, instead of reporting success", async () => {
    mockDelete.mockRejectedValue(new Error("kong is down"));

    const wrapper = await confirmDelete();

    // Emitting here would take the store off the list while it still exists in Kong.
    expect(wrapper.emitted("deleteDataStore")).toBeUndefined();
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    );
  });

  it("stops showing the row as busy after a failed delete", async () => {
    mockDelete.mockRejectedValue(new Error("kong is down"));

    const wrapper = await confirmDelete();

    // A spinner left running would make the row impossible to retry.
    expect(
      wrapper.get("button[aria-label='Delete']").attributes("disabled"),
    ).toBeUndefined();
  });
});
