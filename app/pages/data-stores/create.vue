<script lang="ts" setup>
const route = useRoute();
const preselectedProjectId = computed(() =>
  typeof route.query.projectId === "string" ? route.query.projectId : undefined,
);
</script>

<template>
  <div>
    <Card style="margin-top: 10px">
      <template #title>Create a Data Store for a Project</template>
      <template #content>
        <div class="intro-text">
          <p>
            In order for users to be able to access the data in your
            institution, a data store needs to be created for each approved
            project. A data store is essentially a fileshare, or a specified set
            of permissions granted to the users of a project allowing access to
            a folder on your system.
          </p>
          <p>
            To create a data store, fill out the fields below, starting with the
            project which will be granted access to the data followed by the
            technical information defining the data's location.
          </p>
          <p>
            Helpful tooltips can be shown when hovering over each field, an
            additional detailed information about what is required for each
            field can be displayed by clicking on the field name in the left
            column.
          </p>
        </div>
        <DataStoreProjectInitializer
          :preselectedProjectId="preselectedProjectId"
        />
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.intro-text {
  padding-bottom: 3em;
}
</style>
