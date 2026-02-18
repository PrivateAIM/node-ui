import { mount } from "@vue/test-utils";
import { useRuntimeConfig } from "#app";
import { describe, expect, it, vi } from "vitest";
import AvatarButton from "~/components/header/AvatarButton/AvatarButton.vue";

describe("AvatarButton.vue", () => {
  const testUser = "Johnny Storm";

  vi.mocked(useRuntimeConfig);

  async function avatarMenuChecks(authenticated: boolean) {
    const status = authenticated ? "authenticated" : "unauthenticated";
    const expectedIcon = authenticated ? "pi-user" : "pi-question";
    const logPrompt = authenticated ? "Logout" : "Login";
    const userData = authenticated ? { user: { name: testUser } } : {};

    vi.stubGlobal("useAuth", () => ({
      signIn: vi.fn(),
      signOut: vi.fn(),
      status: ref(status),
      data: ref(userData),
    }));

    const wrapper = mount(AvatarButton, {
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
    expect(wrapper).toBeTruthy();

    const avatarBtn = wrapper.find(".avatar-btn");
    const avatarName = wrapper.find(".username-menu-bar");
    expect(avatarBtn.find("span").attributes()["class"]).toContain(
      expectedIcon,
    );

    if (authenticated) {
      expect(avatarName.text()).toBeTruthy();
      expect(avatarName.text()).toBe(testUser);
    }

    await avatarBtn.trigger("click");

    const menu = wrapper.find(".avatar-menu");
    expect(menu.text()).toContain("Keycloak");
    expect(menu.text()).toContain(logPrompt);

    const keycloakAdminBtn = menu
      .findAll("a")
      .find((e1) => e1.text() === "Node Keycloak Admin");
    if (keycloakAdminBtn) {
      expect(keycloakAdminBtn.attributes()["href"]).toBe(
        "https://fakenode.com/keycloak/admin",
      );
    } else {
      throw new Error("Keycloak button not found in avatar menu");
    }
  }

  it("Unauthenticated avatar menu", async () => {
    await avatarMenuChecks(false);
  });

  it("Authenticated avatar menu", async () => {
    await avatarMenuChecks(true);
  });
});
