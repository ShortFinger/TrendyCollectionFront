<template>
  <div class="page shipping-page">
    <el-card>
      <template #header>
        <span>发货管理</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="搜索">
          <el-input v-model="query.keyword" placeholder="订单号/用户ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="发货状态">
          <el-select v-model="query.deliverStatus" placeholder="全部" clearable style="width: 130px">
            <el-option label="待发货" :value="0" />
            <el-option label="备货中" :value="1" />
            <el-option label="部分发货" :value="2" />
            <el-option label="已发货" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="number" label="订单号" min-width="180" />
        <el-table-column prop="userId" label="用户ID" width="160" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">¥{{ (row.payMoneyPrice / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="发货状态" width="100">
          <template #default="{ row }">
            <el-tag :type="deliverStatusType(row.deliverStatus)" size="small">{{ deliverStatusText(row.deliverStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column prop="deliveredAt" label="发货时间" width="180">
          <template #default="{ row }">{{ row.deliveredAt || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.deliverStatus < 3" link type="primary" size="small" @click="handleDeliver(row)">发货</el-button>
            <span v-else style="color: #909399; font-size: 12px">已发货</span>
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

    <el-dialog v-model="deliverVisible" title="订单发货" width="450px" :close-on-click-modal="false">
      <el-form :model="deliverForm" label-width="80px">
        <el-form-item label="快递公司">
          <el-input v-model="deliverForm.expressCompany" placeholder="例：顺丰速运" />
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="deliverForm.expressNo" placeholder="快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverVisible = false">取消</el-button>
        <el-button type="primary" :loading="deliverLoading" @click="confirmDeliver">确定发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listOrders, deliverOrder } from '@/api/order'
import type { OrderVO } from '@/types/order'

const loading = ref(false)
const list = ref<OrderVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '', payStatus: 2 as number, deliverStatus: undefined as number | undefined })

const deliverVisible = ref(false)
const deliverLoading = ref(false)
const deliverOrderId = ref('')
const deliverForm = reactive({ expressCompany: '', expressNo: '' })

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size, payStatus: query.payStatus }
    if (query.keyword) params.keyword = query.keyword
    if (query.deliverStatus !== undefined) params.deliverStatus = query.deliverStatus
    const { data } = await listOrders(params)
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { query.page = 1; fetchData() }
function handleReset() {
  query.keyword = ''
  query.deliverStatus = undefined
  query.page = 1
  fetchData()
}

function handleDeliver(row: OrderVO) {
  deliverOrderId.value = row.id
  deliverForm.expressCompany = ''
  deliverForm.expressNo = ''
  deliverVisible.value = true
}

async function confirmDeliver() {
  deliverLoading.value = true
  try {
    await deliverOrder(deliverOrderId.value, deliverForm)
    ElMessage.success('发货成功')
    deliverVisible.value = false
    fetchData()
  } finally {
    deliverLoading.value = false
  }
}

function deliverStatusText(s: number) { return { 0: '待发货', 1: '备货中', 2: '部分发货', 3: '已发货' }[s] || '未知' }
function deliverStatusType(s: number) { return { 0: 'warning', 1: 'info', 2: 'primary', 3: 'success' }[s] as any || 'info' }

onMounted(fetchData)
</script>

<style scoped>
.shipping-page .filter-form { margin-bottom: 16px; }
</style>
