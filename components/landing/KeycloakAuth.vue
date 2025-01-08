<script setup lang="ts">
// const { loggedIn, login } = useOidcAuth();
const { signIn, signOut, status } = useAuth();
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
    <div v-if="status === 'authenticated'">
      <Button @click="signOut()" severity="warn" outlined>Sign Out</Button>
    </div>
    <div v-else>
      <Button @click="signIn('keycloak')" severity="success" outlined
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
