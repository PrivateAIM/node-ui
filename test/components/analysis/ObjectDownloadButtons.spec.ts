import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { useToast } from "primevue/usetoast";
import ObjectDownloadButtons from "~/components/analysis/ObjectDownloadButtons.vue";

const mockLocal = vi.fn();
const mockIntermediate = vi.fn();

vi.mock("~/composables/useAPIFetch", () => ({
  downloadLocalObject: (...args: unknown[]) => mockLocal(...args),
  downloadIntermediateObject: (...args: unknown[]) => mockIntermediate(...args),
}));

const OBJECT_ID = "0f9a2f3c-7b1e-4a51-9a1f-2c9d3f8e7a10";

describe("ObjectDownloadButtons.vue", () => {
  let toastAdd: ReturnType<typeof vi.fn>;
  let clicked: HTMLAnchorElement[];

  beforeAll(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:fake-object-url"),
    });

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
  });

  beforeEach(() => {
    clicked = [];
    toastAdd = vi.fn();
    vi.mocked(useToast).mockReturnValue({ add: toastAdd });
    mockLocal.mockResolvedValue(new Blob(["result"]));
    mockIntermediate.mockResolvedValue(new Blob(["result"]));
  });

  afterEach(() => {
    mockLocal.mockReset();
    mockIntermediate.mockReset();
  });

  function mountButtons(props: Record<string, unknown> = {}) {
    return mount(ObjectDownloadButtons, {
      props: { objectId: OBJECT_ID, ...props },
    });
  }

  async function download(props: Record<string, unknown> = {}) {
    const wrapper = mountButtons(props);
    await wrapper.get("button").trigger("click");
    await flushPromises();

    return wrapper;
  }

  it("hands the downloaded blob to an anchor named after the object", async () => {
    await download();

    expect(clicked).toHaveLength(1);
    expect(clicked[0]!.download).toBe(OBJECT_ID);
    expect(clicked[0]!.href).toContain("blob:fake-object-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it("reads a local object from the local endpoint", async () => {
    await download();

    expect(mockLocal).toHaveBeenCalledWith(OBJECT_ID);
    expect(mockIntermediate).not.toHaveBeenCalled();
  });

  it("reads a non-local object from the intermediate endpoint", async () => {
    await download({ isLocal: false });

    expect(mockIntermediate).toHaveBeenCalledWith(OBJECT_ID);
    expect(mockLocal).not.toHaveBeenCalled();
  });

  it("says the download failed rather than saving an empty file", async () => {
    mockLocal.mockRejectedValue(new Error("object is gone"));

    await download();

    expect(clicked).toHaveLength(0);
    expect(toastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        detail: expect.stringContaining(OBJECT_ID),
      }),
    );
  });
});
