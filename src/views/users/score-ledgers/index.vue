<template>
  <div class="page ledger-page">
    <el-card>
      <template #header>
        <span>积分记录</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" placeholder="可选；空为全站须选时间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="query.bizType" placeholder="全部" clearable style="width: 180px">
            <el-option label="ORDER_PAY_DEDUCT" value="ORDER_PAY_DEDUCT" />
            <el-option label="REFUND_CREDIT" value="REFUND_CREDIT" />
            <el-option label="ADMIN_GRANT" value="ADMIN_GRANT" />
            <el-option label="ADMIN_DEDUCT" value="ADMIN_DEDUCT" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="订单/单号/备注" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
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
        <el-table-column prop="createTime" label="时间" width="170" />
        <el-table-column prop="userId" label="用户ID" width="200" show-overflow-tooltip />
        <el-table-column prop="bizType" label="类型" width="140" />
        <el-table-column prop="changeAmount" label="变动" width="90" />
        <el-table-column prop="beforeBalance" label="变更前" width="90" />
        <el-table-column prop="afterBalance" label="变更后" width="90" />
        <el-table-column prop="orderId" label="订单ID" min-width="160" show-overflow-tooltip />
        <el-table-column prop="bizNo" label="业务单号" min-width="140" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { listScoreLedgers } from '@/api/user-ledger'
import type { LedgerEntryVO } from '@/types/user-ledger'

const route = useRoute()
const loading = ref(false)
const list = ref<LedgerEntryVO[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const query = reactive({
  page: 1,
  size: 10,
  userId: '' as string | undefined,
  bizType: '' as string | undefined,
  keyword: '' as string | undefined,
})

function timeParams() {
  if (dateRange.value && dateRange.value.length === 2) {
    return { startTime: dateRange.value[0], endTime: dateRange.value[1] }
  }
  return { startTime: undefined, endTime: undefined }
}

async function fetchData() {
  const uid = query.userId?.trim()
  const t = timeParams()
  if (!uid && (!t.startTime || !t.endTime)) {
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const { data } = await listScoreLedgers({
      page: query.page,
      size: query.size,
      userId: uid || undefined,
      bizType: query.bizType || undefined,
      keyword: query.keyword || undefined,
      ...t,
    })
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
  query.page = 1
  query.size = 10
  query.bizType = ''
  query.keyword = ''
  dateRange.value = null
  const qUid = route.query.userId
  query.userId = typeof qUid === 'string' ? qUid : ''
  fetchData()
}

onMounted(() => {
  const qUid = route.query.userId
  if (typeof qUid === 'string' && qUid) {
    query.userId = qUid
  }
  fetchData()
})
</script>

<style scoped>
.filter-form {
  margin-bottom: 8px;
}
</style>
