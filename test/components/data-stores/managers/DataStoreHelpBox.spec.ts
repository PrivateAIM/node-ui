import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DataStoreHelpBox from "~/components/data-stores/managers/DataStoreHelpBox.vue";
import { HelpTextField } from "~/components/data-stores/managers";

describe("DataStoreHelpBox.vue", () => {
  function checkHelpBox(
    helpTextField: string,
    expectedHeader: string,
    testString: string,
  ) {
    const wrapper = mount(DataStoreHelpBox, {
      props: {
        helpField: helpTextField,
      },
    });
    expect(DataStoreHelpBox).toBeTruthy();
    const header = wrapper.find(".p-panel-header");
    expect(header.text()).toContain(expectedHeader);

    const content = wrapper.find(".p-panel-content");
    expect(content.text()).toContain(testString);

    const closeButton = wrapper.find(".help-box-close-btn");
    closeButton.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("closeHelp");
  }

  it("Render methods help box", () => {
    checkHelpBox(HelpTextField.Methods, "Allowed Methods", "request methods");
  });

  it("Render data path help box", () => {
    checkHelpBox(
      HelpTextField.Path,
      "Data Path",
      "admin must provide the absolute",
    );
  });

  it("Render server port help box", () => {
    checkHelpBox(
      HelpTextField.Port,
      "Server Port",
      "firewalls are used to prevent",
    );
  });

  it("Render communication protocol help box", () => {
    checkHelpBox(
      HelpTextField.Protocol,
      "Communication Protocol",
      "HTTP over TLS",
    );
  });

  it("Render server help box", () => {
    checkHelpBox(HelpTextField.Server, "Server Host", "hostname or IP address");
  });

  it("Render data store type help box", () => {
    checkHelpBox(
      HelpTextField.Type,
      "Data Store Type",
      "setup specific plugins",
    );
  });
});
