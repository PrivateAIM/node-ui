<script setup lang="ts">
const { loggedIn, user, login, logout } = useOidcAuth();
</script>

<template>
  <div>
    <h1>Node UI Home Page</h1>
  </div>
  <div v-if="loggedIn">
    <h1>Welcome {{ user.userName }}!</h1>
    <p>Logged in since {{ user.loggedInAt }}</p>
    <button @click="logout()">Logout</button>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
    <!--    <a href="/auth/github/login">Login with GitHub</a>-->
    <button @click="login()">Login with default provider</button>
  </div>
</template>

<style scoped lang="scss"></style>
