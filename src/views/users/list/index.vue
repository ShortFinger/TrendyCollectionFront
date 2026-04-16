<template>
  <div class="page user-list-page">
    <el-card>
      <template #header>
        <span>用户列表</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="手机/昵称">
          <el-input v-model="query.keyword" placeholder="手机号或昵称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" placeholder="精确匹配" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item label="最后活跃">
          <el-date-picker
            v-model="lastActiveRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
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
      <el-table
        :data="list"
        stripe
        style="width: 100%"
        v-loading="loading"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="200" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="累计支付" width="120" prop="paidMoneyTotal" sortable="custom">
          <template #default="{ row }">¥{{ ((row.paidMoneyTotal ?? 0) / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="scoreBalance" label="积分余额" width="110" sortable="custom" />
        <el-table-column prop="mithrilBalance" label="秘银余额" width="110" sortable="custom" />
        <el-table-column prop="luckyScore" label="欧气值" width="100" sortable="custom" />
        <el-table-column prop="createTime" label="注册时间" width="180" sortable="custom" />
        <el-table-column prop="lastActiveTime" label="最后活跃" width="180" sortable="custom">
          <template #default="{ row }">{{ row.lastActiveTime ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetailPlaceholder">详情</el-button>
            <el-button link type="primary" size="small" @click="goScoreLedgers(row)">积分</el-button>
            <el-button link type="primary" size="small" @click="goMithrilLedgers(row)">秘银</el-button>
          </template>
        </el-table-column>
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listEndUsers } from '@/api/end-user'
import type { EndUserVO } from '@/types/end-user'

const router = useRouter()
const loading = ref(false)
const list = ref<EndUserVO[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)
const lastActiveRange = ref<[string, string] | null>(null)

const sortField = ref<string | undefined>(undefined)
const sortOrder = ref<'asc' | 'desc' | undefined>(undefined)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '' as string | undefined,
  userId: '' as string | undefined,
})

function syncRegisterRange() {
  if (dateRange.value && dateRange.value.length === 2) {
    return { registerStartTime: dateRange.value[0], registerEndTime: dateRange.value[1] }
  }
  return { registerStartTime: undefined, registerEndTime: undefined }
}

function syncLastActiveRange() {
  if (lastActiveRange.value && lastActiveRange.value.length === 2) {
    return { lastActiveStartTime: lastActiveRange.value[0], lastActiveEndTime: lastActiveRange.value[1] }
  }
  return { lastActiveStartTime: undefined, lastActiveEndTime: undefined }
}

function handleSortChange({ prop, order }: { prop?: string; order: string | null }) {
  if (!order || !prop) {
    sortField.value = undefined
    sortOrder.value = undefined
  } else {
    sortField.value = prop as string
    sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  }
  query.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const reg = syncRegisterRange()
    const la = syncLastActiveRange()
    const { data } = await listEndUsers({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      userId: query.userId || undefined,
      ...reg,
      ...la,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
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
  query.keyword = ''
  query.userId = ''
  query.page = 1
  query.size = 10
  dateRange.value = null
  lastActiveRange.value = null
  sortField.value = undefined
  sortOrder.value = undefined
  fetchData()
}

function handleDetailPlaceholder() {
  ElMessage.info('详情功能待开发')
}

function goScoreLedgers(row: EndUserVO) {
  router.push({ path: '/users/score-ledgers', query: { userId: row.id } })
}

function goMithrilLedgers(row: EndUserVO) {
  router.push({ path: '/users/mithril-ledgers', query: { userId: row.id } })
}

onMounted(fetchData)
</script>

<style scoped>
.user-list-page .filter-form {
  margin-bottom: 16px;
}
</style>
