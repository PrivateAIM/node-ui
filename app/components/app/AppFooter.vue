<script lang="ts" setup>
const config = useRuntimeConfig();
const pkgVersion = config.public.version;
</script>

<template>
  <footer>
    <div class="page-footer">
      <div class="footer-row">
        <div class="github-link">
          <a href="https://github.com/PrivateAIM/node-ui/issues">
            <i class="pi pi-github" style="padding-right: 5px"></i>Submit an
            Issue</a
          >
        </div>
        <div class="copyright">
          © 2026
          <a href="https://privateaim.de/" style="padding-left: 5px"
            >PrivateAim</a
          >
        </div>

        <div class="build-version">
          <Badge>
            <span>v{{ pkgVersion }}</span>
          </Badge>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.page-footer {
  padding: 0.625rem 0;
  color: var(--p-text-muted-color);
  background: var(--p-menubar-background);
  border-top: 1px solid var(--p-menubar-border-color);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06), 0 -1px 2px rgba(0, 0, 0, 0.04);
}

.footer-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0 var(--page-padding-x);
}

.copyright {
  display: flex;
  justify-content: center;
}

.build-version {
  display: flex;
  justify-content: flex-end;
}
</style>
