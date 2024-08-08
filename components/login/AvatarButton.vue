<script setup lang="ts">
import { useKeycloak } from "@/stores/keycloak";

const kc = useKeycloak();

const menu = ref();
const loggedOutUserMenuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: "Login",
        icon: "pi pi-sign-in",
        command: () => {
          kc!.login();
        },
      },
    ],
  },
]);
const loggedInUserMenuItems = ref([
  {
    label: "Options",
    items: [
      {
        label: "Logout",
        icon: "pi pi-sign-out",
        command: () => {
          kc!.login();
        },
      },
    ],
  },
]);
const toggle = (event) => {
  menu.value.toggle(event);
};
</script>

<template>
  <div v-if="kc" class="authAvatarSection">
    <!--    <div class="usernameMenuBar">-->
    <!--      <p>-->
    <!--        {{ kc.keycloak!.userProfile.Name }}-->
    <!--      </p>-->
    <!--    </div>-->
    <!--    <Button-->
    <!--      type="button"-->
    <!--      icon="pi pi-user"-->
    <!--      @click="toggle"-->
    <!--      aria-haspopup="true"-->
    <!--      aria-controls="overlay_menu"-->
    <!--      rounded-->
    <!--      severity="contrast"-->
    <!--    />-->
    <!--    <Menu-->
    <!--      ref="menu"-->
    <!--      id="overlay_menu"-->
    <!--      :model="loggedInUserMenuItems"-->
    <!--      :popup="true"-->
    <!--    />-->
    <!--  </div>-->
    <!--  <div v-else>-->
    <!--    <Button-->
    <!--      type="button"-->
    <!--      icon="pi pi-question"-->
    <!--      @click="toggle"-->
    <!--      aria-haspopup="true"-->
    <!--      aria-controls="overlay_menu"-->
    <!--      rounded-->
    <!--      severity="secondary"-->
    <!--    />-->
    <!--    <Menu-->
    <!--      ref="menu"-->
    <!--      id="overlay_menu"-->
    <!--      :model="loggedOutUserMenuItems"-->
    <!--      :popup="true"-->
    <!--    />-->
  </div>
</template>

<style scoped lang="scss">
.authAvatarSection {
  display: flex;
}

.usernameMenuBar {
  vertical-align: center;
  margin-right: 15px;
  height: auto;
  font-weight: bold;
}
</style>
