<script lang="ts" setup>
import IdpAuthBtns from "~/components/landing/IdpAuthBtns.vue";

const { data } = useAuth();
</script>

<template>
  <div class="landing-buttons">
    <div v-if="!data" class="login-or-learn-container">
      <div class="idp-btn landing-btn">
        <IdpAuthBtns />
      </div>
      <div class="learn-more-btn landing-btn">
        <NuxtLink
          rel="noopener"
          target="_blank"
          to="https://privateaim.de/de/index.html"
        >
          <Button label="privateaim" outlined severity="contrast"
            >Learn More
          </Button>
        </NuxtLink>
      </div>
    </div>
    <div v-else class="get-started-container">
      <h2 class="get-started-heading">What would you like to do today?</h2>
      <div class="get-started-btns">
        <a class="get-started-btn" href="/projects">
          <i class="pi pi-objects-column get-started-btn-icon" />
          <p>Review projects and their statuses</p>
        </a>
        <a class="get-started-btn" href="/analyses">
          <i class="pi pi-lightbulb get-started-btn-icon" />
          <p>Inspect individual analyses</p>
        </a>
        <a class="get-started-btn" href="/data-stores/create">
          <i class="pi pi-hammer get-started-btn-icon" />
          <p>Create a data store for a project</p>
        </a>
        <a class="get-started-btn" href="/data-stores">
          <i class="pi pi-wrench get-started-btn-icon" />
          <p>Manage the active data stores</p>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-or-learn-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.get-started-container {
  margin-top: 3rem;
}

.get-started-heading {
  text-align: center;
  margin-block-start: 0;
  margin-bottom: 1rem;
}

.get-started-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

a.get-started-btn {
  border: 1px solid var(--p-surface-200);
  border-radius: 0.5rem;
  background: var(--p-surface-50);
  text-decoration: none;
  text-align: center;
  color: var(--p-text-color);
  padding: 1.25rem 1rem;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  cursor: pointer;
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

a.get-started-btn:hover {
  border-color: var(--p-primary-color);
  background-color: color-mix(in srgb, var(--p-primary-color) 6%, transparent);
  color: var(--p-primary-color);
}

// Dark mode: surface-50 resolves to stone-50 (near-white) — swap to a dark surface
:global(.flame-dark a.get-started-btn) {
  background: var(--p-surface-800);
  border-color: var(--p-surface-600);
}

.get-started-btn p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .get-started-btns {
    grid-template-columns: 1fr;
  }
}

.get-started-btn-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  margin-bottom: 0.5rem;
}

.landing-btn {
  padding: 0.5rem;
}
</style>
