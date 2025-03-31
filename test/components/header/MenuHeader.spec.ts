import { mount } from "@vue/test-utils";
import { useRuntimeConfig } from "#app";
import { vi, describe, it, expect } from "vitest";
import MenuHeader from "~/components/header/MenuHeader.vue";

describe("MenuHeader.vue", () => {
  vi.mocked(useRuntimeConfig);

  async function menuHeaderChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const menuTitles = ["Home", "Projects", "Analyses", "Data Stores"];

    vi.stubGlobal("useAuth", () => ({
      status: ref(status),
    }));

    const wrapper = mount(MenuHeader);
    expect(wrapper).toBeTruthy();

    const menuBar = wrapper.find(".menu-bar-header");

    for (const title of menuTitles) {
      const menuItem = menuBar.find(`li[aria-label="${title}"]`);
      expect(menuItem.attributes()["aria-level"]).toBe("1"); // Top level menu item
      const menuLink = menuItem.find(".p-menubar-item-link");

      if (!authenticated && title !== "Home") {
        expect(menuLink.classes()).toContain("p-disabled");
      } else {
        expect(menuLink.classes()).toContain("enabled");
      }
    }
  }

  it("Unauthenticated menu header", async () => {
    await menuHeaderChecks(false);
  });

  it("Authenticated menu header", async () => {
    await menuHeaderChecks(true);
  });
});
