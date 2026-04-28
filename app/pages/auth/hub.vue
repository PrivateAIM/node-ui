<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

definePageMeta({ auth: false });

const { signIn } = useAuth();
const router = useRouter();

const username = ref("");
const password = ref("");
const errorMsg = ref("");
const loading = ref(false);

async function submit() {
  errorMsg.value = "";
  loading.value = true;
  try {
    const result = await signIn("hub", {
      username: username.value,
      password: password.value,
      callbackUrl: "/",
      redirect: true,
    });
    if (result?.error) {
      errorMsg.value = "Invalid username or password.";
    } else {
      router.push("/");
    }
  } catch {
    errorMsg.value = "Sign in failed. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="hub-signin-page">
    <div class="hub-signin-card">
      <h2 class="hub-signin-title">Sign in via the Hub</h2>
      <form class="hub-signin-form" @submit.prevent="submit">
        <div class="field">
          <label for="hub-username">Username</label>
          <InputText
            id="hub-username"
            v-model="username"
            autocomplete="username"
            autofocus
            required
          />
        </div>
        <div class="field">
          <label for="hub-password">Password</label>
          <InputText
            id="hub-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="errorMsg" class="hub-signin-error">{{ errorMsg }}</p>
        <div class="hub-signin-actions">
          <Button
            label="Cancel"
            severity="secondary"
            text
            type="button"
            @click="router.push('/')"
          />
          <Button type="submit" label="Sign in" :loading="loading" />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hub-signin-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hub-signin-card {
  width: 100%;
  max-width: 22rem;
  padding: 2rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 0.5rem;
}

.hub-signin-title {
  margin: 0 0 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.hub-signin-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    label {
      font-size: 0.9rem;
    }

    input {
      width: 100%;
    }
  }
}

.hub-signin-error {
  color: var(--p-red-500);
  font-size: 0.85rem;
  margin: 0;
}

.hub-signin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
