import { flushPromises, mount } from "@vue/test-utils";
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import MenuHeader from "~/components/header/MenuHeader.vue";
import { type DefineComponent, defineComponent, ref } from "vue";
import { useAuthState } from "@/test/mockapi/nuxt-auth-mock";

describe("MenuHeader.vue", () => {
  vi.mocked(useRuntimeConfig);

  let MenuHeaderTestComponent: DefineComponent<typeof defineComponent>;

  // Render the component with the fake params
  beforeAll(async () => {
    MenuHeaderTestComponent = defineComponent({
      components: { MenuHeader },
      template: "<Suspense><MenuHeader/></Suspense>",
    });
  });

  async function menuHeaderChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const menuTitles = [
      "Home",
      "Projects",
      "Analyses",
      "Events",
      "Data Stores",
    ];

    vi.mocked(useAuthState).mockReturnValue({
      status: ref(status),
      data: ref(null),
    });

    const wrapper = mount(MenuHeaderTestComponent, {
      global: {
        stubs: { AvatarButton: true, DarkModeToggle: true, PreferencesDialog: true },
      },
    });
    expect(wrapper).toBeTruthy();
    await flushPromises();

    const menuBar = wrapper.find(".menu-bar-header");

    menuTitles.forEach((title, index) => {
      const menuItem = menuBar.find(`li[aria-label="${title}"]`);

      if (!authenticated && title !== "Home") {
        // Non-Home items are filtered out (not just disabled) when unauthenticated
        expect(menuItem.exists()).toBe(false);
      } else {
        expect(menuItem.exists()).toBe(true);
        expect(menuItem.attributes()["aria-posinset"]).toBe(`${index + 1}`); // Top level menu item
      }
    });
  }

  it("Unauthenticated menu header", async () => {
    await menuHeaderChecks(false);
  });

  it("Authenticated menu header", async () => {
    await menuHeaderChecks(true);
  });
});
