import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { fakeLogs } from "./constants";
import AnalysisLogCardContent from "~/components/analysis/logs/AnalysisLogCardContent.vue";

describe("AnalysisLogCardContent.vue", () => {
  it("Render the logs", () => {
    const wrapper = mount(AnalysisLogCardContent, {
      props: { nginxLogs: fakeLogs, analysisLogs: fakeLogs },
    });
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
  });

  it("Report no logs found", () => {
    const wrapper = mount(AnalysisLogCardContent, {});
    expect(wrapper.text()).toContain("No logs found");
  });
});
