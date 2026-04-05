<template>
  <KujiActivityList
    activity-type="UNLIMITED"
    list-base-path="/gameplay/unlimited"
    :labels="KUJI_UNLIMITED_LABELS"
  />
</template>

<script setup lang="ts">
import KujiActivityList from '../shared/KujiActivityList.vue'
import { KUJI_UNLIMITED_LABELS } from '../shared/kujiListLabels'
</script>
