<template>
  <div class="page user-list-page">
    <el-card>
      <template #header>
        <span>用户列表</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="手机/昵称">
          <el-input v-model="query.keyword" placeholder="手机号或昵称" clearable style="width: 220px" :disabled="loading" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" placeholder="用户ID" clearable style="width: 180px" :disabled="loading" />
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="query.registerTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 320px"
            :disabled="loading"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" :disabled="loading" @click="handleSearch">查询</el-button>
          <el-button :disabled="loading" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="累计实付金额" width="140">
          <template #default="{ row }">¥{{ ((row.paidMoneyTotal || 0) / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="query.page"
        :page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        :disabled="loading"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listUsers } from '@/api/user'
import type { UserVO } from '@/types/user'
import { toUserListQueryParams } from './queryParams'

const loading = ref(false)
const list = ref<UserVO[]>([])
const total = ref(0)
const latestRequestId = ref(0)

const initialQueryState = () => ({
  page: 1,
  size: 10,
  keyword: '',
  userId: '',
  registerTimeRange: null as [string, string] | null,
})

const query = reactive(initialQueryState())

async function fetchData() {
  const requestId = ++latestRequestId.value
  loading.value = true
  try {
    const { data } = await listUsers(toUserListQueryParams(query))
    if (requestId !== latestRequestId.value) {
      return
    }
    list.value = data.records
    total.value = data.total
  } finally {
    if (requestId === latestRequestId.value) {
      loading.value = false
    }
  }
}

function handleSearch() {
  if (loading.value) return
  query.page = 1
  fetchData()
}

function handleReset() {
  if (loading.value) return
  Object.assign(query, initialQueryState(), { page: 1, size: query.size })
  fetchData()
}

function handleCurrentChange(page: number) {
  if (loading.value) return
  query.page = page
  fetchData()
}

function handleSizeChange(size: number) {
  if (loading.value) return
  query.size = size
  query.page = 1
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.user-list-page .filter-form {
  margin-bottom: 16px;
}
</style>
