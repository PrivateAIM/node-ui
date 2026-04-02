# Data Stores Component Refactor — Design Spec

**Date:** 2026-04-02  
**Status:** Approved

## Goal

Reduce redundant data passing and eliminate code duplication in the `app/components/data-stores/` component tree without changing visible behaviour.

---

## Section 1: `useDataStoreList` composable

**New file:** `app/composables/useDataStoreList.ts`

Owns all data-fetching and transformation logic currently embedded in `DataStoreList.vue`:

- Calls `getDataStores(true, { lazy: true })` and `getProjects({ lazy: true })`
- Watches both responses via `watchEffect`
- Runs row transformation: format unix timestamps, filter out `kong-admin-service`, extract `projectId` from route paths
- Builds `projectNameMap: Map<string, string | undefined>` from project response
- Exposes: `dataStores`, `projectNameMap`, `loading`, `refresh`

**Updated:** `DataStoreList.vue` calls the composable and passes `dataStores`, `projectNameMap`, and `loading` to `DetailedDataStoreTable`. All transformation logic is removed from the component.

**Unchanged:** `DetailedDataStoreTable.vue` continues to receive the same three props and computes display rows internally.

---

## Section 2: Collapse `ResourceManagerTabs`

**Deleted:** `app/components/data-stores/create/ResourceManagerTabs.vue`

**Motivation:** The component is a dead wrapper — its only job is to call `getProjectNodes`, map the result to `availableProject[]`, and pass it down as a prop. It has no tabs and no other logic.

**Changes to `DataStoreProjectInitializer.vue`:**
- Remove the `projects: Array` prop entirely
- Move the `getProjectNodes` fetch and `availableProject[]` mapping inside the component
- Apply the `availableProject` type properly throughout (the prop was previously untyped `Array`)
- The `availableProject` interface moves to `app/components/data-stores/create/index.ts` (already the shared export file for this folder)

**Updated:** `app/pages/data-stores/create.vue` imports and uses `DataStoreProjectInitializer` directly instead of `ResourceManagerTabs`.

---

## Section 3: `DataStoreHelpBox` deduplication

**New file:** `app/components/data-stores/create/DataStoreHelpPanel.vue`

A thin wrapper around PrimeVue `<Panel>` that:
- Accepts `header` as a prop
- Renders the close button in `<template #icons>` (currently copy-pasted 7 times)
- Emits `closeHelp` when the button is clicked
- Accepts default slot content for the panel body

**Updated:** `DataStoreHelpBox.vue` replaces all 7 `<div v-if/v-else-if>` blocks (each containing an identical close button template) with `<DataStoreHelpPanel :header="..." @closeHelp="closeHelp">` wrappers. Expected reduction: ~225 lines → ~80 lines.

---

## Out of scope

- No changes to `DetailedDataStoreTable` internals
- No changes to the filter/reset logic
- No Pinia store introduced
- No changes to API composables in `useAPIFetch.ts`
