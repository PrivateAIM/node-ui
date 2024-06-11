<script setup>
const { loggedIn, user, login, logout } = useOidcAuth();

if (loggedIn.value) {
  console.log("User is logged in");
} else {
  console.log("User is not logged in");
}
</script>

<template>
  <div v-if="loggedIn">
    <h1>Welcome {{ user.userName }}!</h1>
    <p>Logged in since {{ user.loggedInAt }}</p>
    <button @click="logout()">Logout</button>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
    <a href="/auth/github/login">Login with GitHub</a>
    <button @click="login()">Login with default provider</button>
  </div>
</template>

<style scoped lang="scss"></style>
