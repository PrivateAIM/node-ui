import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ProjectProposalTable from "~/components/projects/ProjectProposalTable.vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import type { ProjectNode } from "~/services/Api";
import { fakeProposalsResp } from "~/test/components/projects/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjectNodes: vi.fn(),
}));

describe("ProjectProposalTable.vue", () => {
  let mockToast;
  let ProjectProposalTableTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
    vi.mocked(useToast).mockReturnValue(mockToast);
  });

  // Render the component with the fake params
  beforeAll(async () => {
    ProjectProposalTableTestComponent = defineComponent({
      components: { ProjectProposalTable },
      template: "<Suspense><ProjectProposalTable/></Suspense>",
    });
  });

  test("Return project data", async () => {
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectProposalTableTestComponent);
    await flushPromises();

    expect(ProjectProposalTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Project Proposals"); // H1 of the page

    // Find header and all rows
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1); // Ensure 1 row exists as defined in fakeProposalsResp

    // Verify header contents
    const headerRow = wrapper.findAll("thead tr");
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols[0].text()).toBe("Project Name"); // First col
    expect(headerCols[2].text()).toBe("Approval Status"); // Last col

    // Verify the second row's content
    const secondRowCells = rows[0].findAll("td");
    expect(secondRowCells[0].text()).toBe("fake-project"); // Name
    expect(secondRowCells[1].text()).toBe("fake-node"); // Approval status
    expect(secondRowCells[2].text()).toBe("approved"); // Last Updated
  });

  test("No projects returned", async () => {
    const emptyResp: ProjectNode[] = [];
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectProposalTableTestComponent);
    await flushPromises();

    expect(ProjectProposalTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });

  test("API error", async () => {
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(null),
      pending: ref(false),
      error: ref(null),
      status: ref("error"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectProposalTableTestComponent);
    await flushPromises();

    expect(ProjectProposalTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });
});
