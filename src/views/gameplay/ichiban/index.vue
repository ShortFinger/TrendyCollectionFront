<template>
  <KujiActivityList
    activity-type="ICHIBAN"
    list-base-path="/gameplay/ichiban"
    :labels="KUJI_ICHIBAN_LABELS"
  />
</template>

<script setup lang="ts">
import KujiActivityList from '../shared/KujiActivityList.vue'
import { KUJI_ICHIBAN_LABELS } from '../shared/kujiListLabels'
</script>
