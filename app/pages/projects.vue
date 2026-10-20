<template>
  <div class="proposal-card">
    <Card class="content-card">
      <template #title>Projects</template>
      <template #content>
        <div class="project-description-box description-box">
          <div class="project-description">
            <span
              >The Projects overview gives a quick summary of the projects
              defined within the Hub and their associated analyses. The
              <b>Analyses Overview</b> column contains a distribution bar to
              show the proportion of analyses in their various states.
            </span>
          </div>
        </div>
        <ProjectsTable />
      </template>
    </Card>
  </div>
</template>
