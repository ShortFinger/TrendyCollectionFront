<template>
  <div class="multi-draw-tier-editor">
    <el-table :data="tiers" border size="small" style="width: 100%">
      <el-table-column label="连抽次数" min-width="110">
        <template #default="{ row }">
          <el-input-number v-model="row.drawCount" :min="1" :step="1" controls-position="right" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="人民币减免" min-width="120">
        <template #default="{ row }">
          <el-input-number v-model="row.moneyDiscount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="积分减免" min-width="120">
        <template #default="{ row }">
          <el-input-number v-model="row.scoreDiscount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100">
        <template #default="{ row }">
          <el-input-number v-model="row.sortOrder" :min="0" :step="1" controls-position="right" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row, $index }">
          <el-button
            link
            type="danger"
            size="small"
            :disabled="row.drawCount === 1"
            @click="removeTierRow($index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary" link class="multi-draw-tier-editor__add" @click="addTierRow">增加档位</el-button>
  </div>
</template>

<script setup lang="ts">
import type { MultiDrawTierItem } from '@/types/activity'

const tiers = defineModel<MultiDrawTierItem[]>({ required: true })

function addTierRow() {
  const maxDc = tiers.value.reduce((m, x) => Math.max(m, x.drawCount || 0), 0)
  tiers.value.push({
    drawCount: maxDc + 1,
    moneyDiscount: 0,
    scoreDiscount: 0,
  })
}

function removeTierRow(index: number) {
  if (tiers.value[index]?.drawCount === 1) return
  tiers.value.splice(index, 1)
}
</script>

<style scoped>
.multi-draw-tier-editor__add {
  margin-top: 8px;
}
</style>
