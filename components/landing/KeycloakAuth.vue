<script setup lang="ts">
const { loggedIn, login } = useOidcAuth();
</script>

<template>
  <div class="keycloak-login-btn landing-btn">
    <!--    <div class="login-welcome" v-if="loggedIn">-->
    <!--      <span class="login-welcome-msg"-->
    <!--        >Welcome <b>{{ user.userName || "Friend" }}</b-->
    <!--        >!</span-->
    <!--      >-->
    <!--      <Button @click="logout()" severity="warning" outlined>Logout</Button>-->
    <!--    </div>-->
    <div v-if="!loggedIn">
      <Button @click="login()" severity="success" outlined
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-welcome {
  display: flex;
  flex-direction: row;
  justify-content: safe center;
  align-items: center;
  margin-top: 2em;
  font-size: 1.1em;
}

.login-welcome-msg {
  margin-right: 2em;
}
</style>
