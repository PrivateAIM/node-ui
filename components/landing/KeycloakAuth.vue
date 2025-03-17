<script lang="ts" setup>
const { signIn, signOut, status } = useAuth();
</script>

<template>
  <div class="keycloak-login-btn">
    <div v-if="status === 'authenticated'">
      <Button class="kc-success" outlined severity="warn" @click="signOut()"
        >Sign Out</Button
      >
    </div>
    <div v-else>
      <Button
        class="kc-success"
        outlined
        severity="success"
        @click="signIn('keycloak')"
        >Login with Keycloak</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.flame-light .kc-success {
  border-color: var(--p-green-700);
  color: var(--p-green-600);
}

//.landing-btn {
//  margin: 0.5em;
//  border-width: 0.2em;
//}
//
//.landing-btn:hover {
//  border-width: 0.2em;
//}
</style>
