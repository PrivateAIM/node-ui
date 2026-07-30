import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ProjectProposalTable from "~/components/projects/ProjectProposalTable.vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import type { ProjectNode } from "~/services/hub";
import { fakeProposalsResp } from "@/test/components/projects/constants";

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
      error: ref(undefined),
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
    expect(headerCols.length).toBe(6);
    expect(headerCols[0].text()).toBe("Project Name");
    expect(headerCols[1].text()).toBe("Number of Analyses");
    expect(headerCols[2].text()).toBe("Number of Nodes");
    expect(headerCols[3].text()).toBe("Created On");
    expect(headerCols[4].text()).toBe("Last Updated");
    expect(headerCols[5].text()).toBe("Set Approval");

    // Verify the row's content
    const rowCells = rows[0].findAll("td");
    expect(rowCells[0].text()).toBe("fake-project"); // Project name
    expect(rowCells[1].text()).toBe("17"); // Number of analyses
    expect(rowCells[2].text()).toBe("0"); // Number of nodes

    // The "Set Approval" column renders the toggle with both status tags
    expect(rowCells[5].text()).toContain("approved");
    expect(rowCells[5].text()).toContain("rejected");
  });

  test("No projects returned", async () => {
    const emptyResp: ProjectNode[] = [];
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(undefined),
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
      data: ref(undefined),
      pending: ref(false),
      error: ref(undefined),
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
