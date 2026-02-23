<script setup lang="ts">
import { useRouter } from "#vue-router";
import Button from "primevue/button";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="lock-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h1 class="error-code">403</h1>
      <h2 class="error-title">Access Forbidden</h2>
      <p class="error-description">
        You don't have permission to access this resource. If you believe this
        is a mistake, please contact your administrator.
      </p>

      <div class="error-actions">
        <Button @click="goHome" class="btn btn-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Go Home
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-content {
  text-align: center;
  color: var(--p-text-color);
  max-width: 600px;
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lock-icon {
  margin-bottom: 2rem;
  animation: lockShake 0.5s ease-in-out 0.3s;

  svg {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
}

@keyframes lockShake {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.05em;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 1rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.error-description {
  font-size: 1.125rem;
  margin: 1.5rem 0 2.5rem;
  opacity: 0.95;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: 1.75rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
