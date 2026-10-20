import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils"; // add flushPromises
import { useRuntimeConfig } from "nuxt/app";
import { beforeAll, describe, expect, it, vi } from "vitest";
import AvatarButton from "~/components/header/AvatarButton.vue";
import { useAuth, useAuthState } from "@/test/mockapi/nuxt-auth-mock";

describe("AvatarButton.vue", () => {
  const testUser = "Johnny Storm";
  let AvatarButtonTestComponent: typeof AvatarButton;

  vi.mocked(useRuntimeConfig);

  beforeAll(() => {
    AvatarButtonTestComponent = defineComponent({
      components: { AvatarButton },
      template: "<Suspense><AvatarButton/></Suspense>",
    });
  });

  async function avatarMenuChecks() {
    const userData = { user: { name: testUser } };

    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(useAuthState).mockReturnValue({
      status: ref("authenticated"),
      data: ref(userData),
    });

    const wrapper = mount(AvatarButtonTestComponent, {
      global: {
        stubs: {
          teleport: true,
          CleanupDialog: true,
          PreferencesDialog: true,
        },
      },
    });

    // flushPromises resolves all pending promises including the async setup
    await flushPromises();

    expect(wrapper).toBeTruthy();

    const avatarBtn = wrapper.find(".avatar-btn");
    const avatarName = wrapper.find(".username-menu-bar");
    expect(avatarBtn.find("span").attributes()["class"]).toContain("pi-user");

    expect(avatarName.text()).toBeTruthy();
    expect(avatarName.text()).toBe(testUser);

    await avatarBtn.trigger("click");
    await flushPromises(); // use flushPromises here too for consistency

    const menu = wrapper.find(".avatar-menu");
    expect(menu.text()).toContain("Logout");

    const accountBtn = menu.findAll("a").find((e1) => e1.text() === "Account");
    const accountUrl = new URL(accountBtn?.attributes()["href"] ?? "");
    expect(`${accountUrl.origin}${accountUrl.pathname}`).toBe(
      "https://auth.fakehub.com/console/account",
    );
    expect(accountUrl.searchParams.get("realmId")).toBe("fakerealm");
    expect(accountUrl.searchParams.get("ref")).toBe(window.location.origin);
  }

  it("Authenticated avatar menu", async () => {
    await avatarMenuChecks();
  });
});
