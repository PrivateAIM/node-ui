<template>
  <div class="card analysis-card">
    <Card class="content-card">
      <template #title>Analyses</template>
      <template #content>
        <AnalysesTable>
          <template #description>
            <span
              >This table provides an overview of the analyses that are
              registered to run on this node. Approved users can <b>start</b>,
              <b>stop</b>, or <b>delete</b> analyses, as well as view the logs
              for both the analysis and associated nginx containers.
            </span>
          </template>
        </AnalysesTable>
      </template>
    </Card>
  </div>
</template>
