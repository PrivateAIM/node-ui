<script setup lang="ts">
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
          <a style="padding-left: 5px" href="https://privateaim.de/"
            >PrivateAim</a
          >
        </div>

        <div class="build-version">
          <span
            ><b>v{{ pkgVersion }}</b></span
          >
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.page-footer {
  box-shadow: 0 6px 0 0 rgba(0, 0, 0, 0.3) inset;
  background-color: #374151;
  padding: 10px 0 4px 0;
  margin: 20px auto;
  color: #aeb2b7;
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
