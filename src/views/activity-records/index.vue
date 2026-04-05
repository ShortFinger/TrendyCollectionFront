<template>
  <div class="page activity-records-page">
    <el-card>
      <template #header>
        <span>活动记录</span>
      </template>

      <el-form :inline="true" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="用户ID/订单号/奖品名称"
            clearable
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="活动ID">
          <el-input
            v-model="query.activityId"
            placeholder="活动ID"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="领取状态">
          <el-select v-model="query.isReceived" placeholder="全部" clearable style="width: 120px">
            <el-option label="已领取" :value="1" />
            <el-option label="未领取" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否连抽">
          <el-select v-model="query.isContinuousDraw" placeholder="全部" clearable style="width: 120px">
            <el-option label="连抽" :value="1" />
            <el-option label="单抽" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="activityTitle" label="活动标题" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.activityTitle || row.activityId }}</template>
        </el-table-column>
        <el-table-column label="活动类型" width="100">
          <template #default="{ row }">{{ activityTypeLabel(row.activityType) }}</template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="160" show-overflow-tooltip />
        <el-table-column prop="skuName" label="奖品名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="价格" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column label="抽取方式" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isContinuousDraw === 1" type="warning" size="small">
              连抽×{{ row.continuousDrawCount }}
            </el-tag>
            <el-tag v-else size="small">单抽</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="领取状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isReceived === 1 ? 'success' : 'info'" size="small">
              {{ row.isReceived === 1 ? '已领取' : '未领取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiveTime" label="领取时间" width="180">
          <template #default="{ row }">{{ row.receiveTime || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="中奖时间" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { listActivityRecords } from '@/api/activityRecord'
import type { ActivityRecordVO, ActivityRecordQueryRequest } from '@/types/activityRecord'
import { activityTypeLabel } from '@/constants/domainCodes'

const loading = ref(false)
const list = ref<ActivityRecordVO[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const query = reactive<ActivityRecordQueryRequest>({
  page: 1,
  size: 10,
  activityId: undefined,
  keyword: undefined,
  isReceived: undefined,
  isContinuousDraw: undefined,
  startTime: undefined,
  endTime: undefined,
})

function handleDateChange(val: [string, string] | null) {
  if (val) {
    query.startTime = val[0]
    query.endTime = val[1]
  } else {
    query.startTime = undefined
    query.endTime = undefined
  }
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.activityId) params.activityId = query.activityId
    if (query.isReceived !== undefined && query.isReceived !== null) params.isReceived = query.isReceived
    if (query.isContinuousDraw !== undefined && query.isContinuousDraw !== null) params.isContinuousDraw = query.isContinuousDraw
    if (query.startTime) params.startTime = query.startTime
    if (query.endTime) params.endTime = query.endTime
    const { data } = await listActivityRecords(params as any)
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

function handleResetQuery() {
  query.keyword = undefined
  query.activityId = undefined
  query.isReceived = undefined
  query.isContinuousDraw = undefined
  query.startTime = undefined
  query.endTime = undefined
  dateRange.value = null
  query.page = 1
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.activity-records-page .filter-form {
  margin-bottom: 16px;
}
</style>
