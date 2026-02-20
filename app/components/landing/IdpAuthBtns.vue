<script lang="ts" setup>
import { useRuntimeConfig } from "nuxt/app";

const { signIn, signOut, status } = useAuth();
const config = useRuntimeConfig();
const idpProvider: string = config.public.idpProvider as string;
const idpNameCapitalized: string =
  idpProvider.charAt(0).toUpperCase() + idpProvider.slice(1);
</script>

<template>
  <div class="idp-login-btn">
    <div v-if="status === 'authenticated'">
      <Button
        class="idp-auth-success"
        outlined
        severity="warn"
        @click="signOut()"
        >Sign Out
      </Button>
    </div>
    <div v-else>
      <Button
        class="idp-auth-success"
        outlined
        severity="success"
        @click="signIn(`${idpProvider}`)"
        >Login with {{ idpNameCapitalized }}
      </Button>
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

.flame-light .idp-auth-success {
  border-color: var(--p-green-700);
  color: var(--p-green-600);
}

span::first-letter {
  text-transform: uppercase;
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
