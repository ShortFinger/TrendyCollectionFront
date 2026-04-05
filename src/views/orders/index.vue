<template>
  <div class="page orders-page">
    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span>订单管理</span>
          <el-button @click="handleExport">导出</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane name="unpaid">
          <template #label>
            <span>待付款<el-badge v-if="statusCounts.unpaidCount > 0" :value="statusCounts.unpaidCount" :max="999" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="paid">
          <template #label>
            <span>已付款<el-badge v-if="statusCounts.paidCount > 0" :value="statusCounts.paidCount" :max="999" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="shipped">
          <template #label>
            <span>已发货<el-badge v-if="statusCounts.shippedCount > 0" :value="statusCounts.shippedCount" :max="999" class="tab-badge" /></span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已关闭" name="closed" />
      </el-tabs>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="搜索">
          <el-input v-model="query.keyword" placeholder="订单号/用户ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="下单时间">
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
        <el-form-item label="金额(元)">
          <div style="display: flex; align-items: center; gap: 4px;">
            <el-input-number v-model="amountRange.min" :min="0" :precision="2" :controls="false" placeholder="最低" style="width: 110px" />
            <span>-</span>
            <el-input-number v-model="amountRange.max" :min="0" :precision="2" :controls="false" placeholder="最高" style="width: 110px" />
          </div>
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
        <el-table-column label="积分" width="100">
          <template #default="{ row }">{{ row.payScorePrice || 0 }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusType(row.status)" size="small">{{ orderStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="payStatusType(row.payStatus)" size="small">{{ payStatusText(row.payStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发货状态" width="100">
          <template #default="{ row }">
            <el-tag :type="deliverStatusType(row.deliverStatus)" size="small">{{ deliverStatusText(row.deliverStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row.id)">详情</el-button>
            <el-button
              v-if="row.payStatus === 'PAID' && canManualDeliver(row.deliverStatus)"
              link
              type="success"
              size="small"
              @click="handleDeliver(row)"
            >发货</el-button>
            <el-button v-if="row.status !== 'CLOSED' && row.status !== 'COMPLETED'" link type="danger" size="small" @click="handleClose(row)">关闭</el-button>
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

    <el-dialog v-model="detailVisible" title="订单详情" width="700px">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="订单号">{{ detail.number }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ orderStatusText(detail.status) }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">{{ payStatusText(detail.payStatus) }}</el-descriptions-item>
        <el-descriptions-item label="发货状态">{{ deliverStatusText(detail.deliverStatus) }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ detail.payType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应付金额">¥{{ ((detail.payMoneyPrice || 0) / 100).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="应付积分">{{ detail.payScorePrice || 0 }}</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ ((detail.carriage || 0) / 100).toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="用户备注">{{ detail.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.moneyPaidAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ detail.deliveredAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ detail.completedAt || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import { listOrders, getOrderDetail, deliverOrder, closeOrder, exportOrders, getOrderStatusCounts } from '@/api/order'
import type { OrderVO, OrderDetailVO, OrderStatusCountVO } from '@/types/order'
import {
  PayStatusCode,
  DeliverStatusCode,
  OrderStatusCode,
  canManualDeliver,
  orderStatusText,
  orderStatusType,
  payStatusText,
  payStatusType,
  deliverStatusText,
  deliverStatusType,
} from '@/constants/domainCodes'

const loading = ref(false)
const list = ref<OrderVO[]>([])
const total = ref(0)
const activeTab = ref('all')
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined as string | undefined,
  payStatus: undefined as string | undefined,
  deliverStatus: undefined as string | undefined,
})
const statusCounts = reactive<OrderStatusCountVO>({ unpaidCount: 0, paidCount: 0, shippedCount: 0 })
const dateRange = ref<[string, string] | null>(null)
const amountRange = reactive({ min: undefined as number | undefined, max: undefined as number | undefined })

const detailVisible = ref(false)
const detail = ref<OrderDetailVO | null>(null)

const deliverVisible = ref(false)
const deliverLoading = ref(false)
const deliverOrderId = ref('')
const deliverForm = reactive({ expressCompany: '', expressNo: '' })

const tabToFilter: Record<string, Partial<typeof query>> = {
  all: { status: undefined, payStatus: undefined, deliverStatus: undefined },
  unpaid: { payStatus: PayStatusCode.UNPAID, status: undefined, deliverStatus: undefined },
  paid: { payStatus: PayStatusCode.PAID, status: undefined, deliverStatus: undefined },
  shipped: { deliverStatus: DeliverStatusCode.SHIPPED, status: undefined, payStatus: undefined },
  completed: { status: OrderStatusCode.COMPLETED, payStatus: undefined, deliverStatus: undefined },
  closed: { status: OrderStatusCode.CLOSED, payStatus: undefined, deliverStatus: undefined },
}

function handleTabChange(tab: string | number) {
  const filters = tabToFilter[tab as string] || {}
  Object.assign(query, filters)
  query.page = 1
  fetchData()
}

async function fetchStatusCounts() {
  try {
    const { data } = await getOrderStatusCounts()
    Object.assign(statusCounts, data)
  } catch { /* ignore */ }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.status !== undefined) params.status = query.status
    if (query.payStatus !== undefined) params.payStatus = query.payStatus
    if (query.deliverStatus !== undefined) params.deliverStatus = query.deliverStatus
    if (dateRange.value) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    if (amountRange.min !== undefined) params.minAmount = Math.round(amountRange.min * 100)
    if (amountRange.max !== undefined) params.maxAmount = Math.round(amountRange.max * 100)
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
  dateRange.value = null
  amountRange.min = undefined
  amountRange.max = undefined
  activeTab.value = 'all'
  Object.assign(query, tabToFilter.all)
  query.page = 1
  fetchData()
}

async function handleDetail(id: string) {
  const { data } = await getOrderDetail(id)
  detail.value = data
  detailVisible.value = true
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
    fetchStatusCounts()
  } finally {
    deliverLoading.value = false
  }
}

async function handleClose(row: OrderVO) {
  await ElMessageBox.confirm('确定关闭该订单？', '提示', { type: 'warning' })
  await closeOrder(row.id, { reason: '管理员关闭' })
  ElMessage.success('订单已关闭')
  fetchData()
  fetchStatusCounts()
}

async function handleExport() {
  try {
    const res = await exportOrders(query) as any
    const blob = new Blob([res], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => { fetchData(); fetchStatusCounts() })
</script>

<style scoped>
.orders-page .filter-form { margin-bottom: 16px; }
.tab-badge {
  margin-left: 4px;
  vertical-align: middle;
}
.tab-badge :deep(.el-badge__content) {
  top: -2px;
}
</style>
