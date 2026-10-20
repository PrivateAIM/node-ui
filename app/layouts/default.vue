<template>
  <div class="app-container">
    <AppHeader />
    <main class="page-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1 0 auto;
  padding: var(--page-padding-y) var(--page-padding-x);
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
}
</style>
