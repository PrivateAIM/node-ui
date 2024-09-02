<script setup lang="ts"></script>

<template>
  <footer>
    <div class="page-footer">
      <div class="footer-description">
        <div class="github">
          <a
            href="https://github.com/PrivateAIM/node-ui/issues"
            class="github-link"
          >
            <i class="pi pi-github" style="padding-right: 5px"></i>Submit an
            Issue</a
          >
          - © 2024
          <a href="https://privateaim.de/">PrivateAim</a>
        </div>
        <div class="copyright"></div>
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

.footer-description {
  text-align: center;
}

.github-link {
  padding: 0 5px 0 0;
}
</style>
