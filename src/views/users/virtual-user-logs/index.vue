<template>
  <div class="page virtual-user-logs-page">
    <el-card>
      <template #header>
        <span>虚拟陪跑日志</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="活动ID">
          <el-input v-model="query.campaignId" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="虚拟用户">
          <el-input v-model="query.virtualUserId" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="规则ID">
          <el-input v-model="query.ruleId" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.executeStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="SUCCESS" value="SUCCESS" />
            <el-option label="SKIPPED" value="SKIPPED" />
            <el-option label="FAILED" value="FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="executeTime" label="执行时间" width="170" />
        <el-table-column prop="executeStatus" label="状态" width="88" />
        <el-table-column prop="eventType" label="事件" width="88" />
        <el-table-column prop="campaignId" label="活动" width="140" show-overflow-tooltip />
        <el-table-column prop="virtualUserId" label="虚拟用户" width="160" show-overflow-tooltip />
        <el-table-column prop="ruleId" label="规则" width="160" show-overflow-tooltip />
        <el-table-column prop="dedupBucket" label="dedup" width="100" />
        <el-table-column prop="skipOrFailReason" label="原因" min-width="140" show-overflow-tooltip />
        <el-table-column prop="eventPayload" label="payload" min-width="160" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { listVirtualUserActionLogs } from '@/api/virtual-user'
import type { VirtualUserActionLogVO } from '@/types/virtual-user'

const loading = ref(false)
const list = ref<VirtualUserActionLogVO[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  page: 1,
  size: 10,
  campaignId: '' as string | undefined,
  virtualUserId: '' as string | undefined,
  ruleId: '' as string | undefined,
  executeStatus: '' as string | undefined,
})

function timeParams() {
  if (dateRange.value?.length === 2) {
    return { executeStartTime: dateRange.value[0], executeEndTime: dateRange.value[1] }
  }
  return {}
}

async function fetchData() {
  loading.value = true
  try {
    const res = await listVirtualUserActionLogs({
      page: query.page,
      size: query.size,
      campaignId: query.campaignId || undefined,
      virtualUserId: query.virtualUserId || undefined,
      ruleId: query.ruleId || undefined,
      executeStatus: query.executeStatus || undefined,
      ...timeParams(),
    })
    const data = res.data
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchData()
}

function handleReset() {
  query.campaignId = ''
  query.virtualUserId = ''
  query.ruleId = ''
  query.executeStatus = ''
  query.page = 1
  query.size = 10
  dateRange.value = null
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
}
</style>
