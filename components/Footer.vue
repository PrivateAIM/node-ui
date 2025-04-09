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
          © 2025
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
  padding: 5px 0 5px 0;
  margin: 20px auto;
  color: #aeb2b7;
  background: var(--p-menubar-background);
  border: 1px solid var(--p-menubar-border-color);
}

.footer-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 2px 10px 2px 10px;
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
