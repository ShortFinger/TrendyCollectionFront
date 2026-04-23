<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>盒柜发货</span>
      </template>

      <el-tabs v-model="activeTab" class="status-tabs" @tab-change="onTabChange">
        <el-tab-pane :label="pendingLabel" :name="TAB_PENDING" />
        <el-tab-pane :label="shippedLabel" :name="TAB_SHIPPED" />
      </el-tabs>

      <el-form :inline="true" class="filter-form">
        <el-form-item label="申请单ID">
          <el-input v-model="query.shipOrderId" clearable placeholder="shipOrderId" style="width: 180px" />
        </el-form-item>
        <el-form-item label="申请单号">
          <el-input v-model="query.orderNo" clearable placeholder="orderNo" style="width: 180px" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="query.userId" clearable placeholder="userId" style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="rows"
        stripe
        row-key="shipOrderId"
        @row-click="handleRowClick"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="detail-panel">
              <el-skeleton v-if="getDetailState(row.shipOrderId).loading" :rows="3" animated />
              <el-empty
                v-else-if="getDetailState(row.shipOrderId).error"
                description="加载失败，请重试"
                :image-size="80"
              >
                <el-button type="primary" link @click="retryDetail(row.shipOrderId)">重试</el-button>
              </el-empty>
              <el-empty
                v-else-if="getDetailState(row.shipOrderId).loaded && getDetailState(row.shipOrderId).items.length === 0"
                description="暂无SKU明细"
                :image-size="80"
              />
              <el-table v-else :data="getDetailState(row.shipOrderId).items" size="small" stripe>
                <el-table-column prop="skuCode" label="SKU编码" min-width="140" />
                <el-table-column prop="skuName" label="SKU名称" min-width="160" />
                <el-table-column label="主图" width="90">
                  <template #default="{ row: detail }">
                    <el-image
                      v-if="detail.skuImage"
                      :src="detail.skuImage"
                      style="width: 40px; height: 40px"
                      fit="cover"
                      :preview-src-list="[detail.skuImage]"
                      preview-teleported
                    />
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80" />
                <el-table-column label="回收价" width="120">
                  <template #default="{ row: detail }">{{ formatCurrency(detail.recyclePrice) }}</template>
                </el-table-column>
                <el-table-column label="原价" width="120">
                  <template #default="{ row: detail }">{{ formatCurrency(detail.originalPrice) }}</template>
                </el-table-column>
                <el-table-column label="来自哪个活动" min-width="180">
                  <template #default="{ row: detail }">
                    <el-button
                      v-if="buildActivityKeyword(detail)"
                      type="primary"
                      link
                      @click="goToActivity(detail)"
                    >
                      {{ getActivityText(detail) }}
                    </el-button>
                    <span v-else>{{ getActivityText(detail) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="shipOrderId" label="申请单ID" min-width="180" />
        <el-table-column prop="orderNo" label="申请单号" min-width="180" />
        <el-table-column prop="userId" label="用户ID" width="160" />
        <el-table-column prop="assetCount" label="资产数" width="90" />
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">{{ getStatusLabel(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="shippedAt" label="发货时间" width="180">
          <template #default="{ row }">{{ row.shippedAt || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING_REVIEW'"
              type="primary"
              link
              @click.stop="openShipDialog(row.shipOrderId)"
            >
              去发货
            </el-button>
            <span v-else style="color: #909399; font-size: 12px">不可发货</span>
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

    <ShipConfirmDialog v-model="shipDialogVisible" :ship-order-id="currentShipOrderId" @success="refreshAfterStatusChanged" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listCabinetShipOrderItems, listCabinetShipOrders } from '@/api/cabinetShip'
import type { CabinetShipOrderItem, CabinetShipOrderItemDetail, CabinetShipOrderQueryRequest } from '@/types/cabinetShip'
import ShipConfirmDialog from '@/components/shipping/ShipConfirmDialog.vue'

const TAB_PENDING = 'PENDING_REVIEW'
const TAB_SHIPPED = 'SHIPPED'
const statusLabelMap: Record<string, string> = {
  [TAB_PENDING]: '待发货',
  [TAB_SHIPPED]: '已发货',
  PROCESSING: '处理中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

const router = useRouter()

const loading = ref(false)
const tableRef = ref()
const rows = ref<CabinetShipOrderItem[]>([])
const total = ref(0)
const shipDialogVisible = ref(false)
const currentShipOrderId = ref('')
const activeTab = ref(TAB_PENDING)
const showCount = ref(true)
const statusCount = reactive<Record<string, number>>({
  [TAB_PENDING]: 0,
  [TAB_SHIPPED]: 0,
})
const pendingLabel = computed(() => (showCount.value ? `待发货(${statusCount[TAB_PENDING]})` : '待发货'))
const shippedLabel = computed(() => (showCount.value ? `已发货(${statusCount[TAB_SHIPPED]})` : '已发货'))
let fetchSeq = 0
const detailStateMap = reactive<Record<string, { loading: boolean; loaded: boolean; error: string; items: CabinetShipOrderItemDetail[] }>>({})

const query = reactive<CabinetShipOrderQueryRequest>({
  page: 1,
  size: 10,
  shipOrderId: '',
  orderNo: '',
  userId: '',
  status: TAB_PENDING,
})

async function fetchData() {
  const seq = ++fetchSeq
  loading.value = true
  try {
    const params: CabinetShipOrderQueryRequest = {
      page: query.page,
      size: query.size,
      status: query.status,
      shipOrderId: query.shipOrderId || undefined,
      orderNo: query.orderNo || undefined,
      userId: query.userId || undefined,
    }
    const { data } = await listCabinetShipOrders(params)
    if (seq !== fetchSeq) {
      return
    }
    rows.value = data.records
    total.value = data.total
  } finally {
    if (seq === fetchSeq) {
      loading.value = false
    }
  }
}

function getStatusLabel(status?: string) {
  if (!status) return '-'
  return statusLabelMap[status] || `未知(${status})`
}

function getDetailState(shipOrderId: string) {
  if (!detailStateMap[shipOrderId]) {
    detailStateMap[shipOrderId] = { loading: false, loaded: false, error: '', items: [] }
  }
  return detailStateMap[shipOrderId]
}

async function ensureOrderDetail(shipOrderId: string, force = false) {
  const state = getDetailState(shipOrderId)
  if (state.loading) return
  if (!force && state.loaded) return
  state.loading = true
  state.error = ''
  try {
    const { data } = await listCabinetShipOrderItems(shipOrderId)
    state.items = Array.isArray(data) ? data : []
    state.loaded = true
  } catch {
    state.error = '加载失败，请重试'
  } finally {
    state.loading = false
  }
}

async function retryDetail(shipOrderId: string) {
  await ensureOrderDetail(shipOrderId, true)
}

function handleRowClick(row: CabinetShipOrderItem) {
  tableRef.value?.toggleRowExpansion(row)
}

function handleExpandChange(row: CabinetShipOrderItem, expandedRows: CabinetShipOrderItem[]) {
  const expanded = expandedRows.some((item) => item.shipOrderId === row.shipOrderId)
  if (expanded) {
    void ensureOrderDetail(row.shipOrderId)
  }
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '-'
  }
  return `¥${value.toFixed(2)}`
}

function getActivityText(item: CabinetShipOrderItemDetail) {
  return item.activityName?.trim() || item.activityId?.trim() || '-'
}

function buildActivityKeyword(item: CabinetShipOrderItemDetail) {
  return item.activityName?.trim() || item.activityId?.trim() || ''
}

function resolveGameplayPath(activityType?: string) {
  if (activityType === 'ICHIBAN') {
    return '/gameplay/ichiban'
  }
  if (activityType === 'UNLIMITED') {
    return '/gameplay/unlimited'
  }
  return '/gameplay/gacha'
}

function goToActivity(item: CabinetShipOrderItemDetail) {
  const keyword = buildActivityKeyword(item)
  if (!keyword) return
  router.push({
    path: resolveGameplayPath(item.activityType),
    query: { keyword },
  })
}

async function fetchStatusCount() {
  try {
    const [pendingRes, shippedRes] = await Promise.all([
      listCabinetShipOrders({ page: 1, size: 1, status: TAB_PENDING }),
      listCabinetShipOrders({ page: 1, size: 1, status: TAB_SHIPPED }),
    ])
    statusCount[TAB_PENDING] = pendingRes.data.total
    statusCount[TAB_SHIPPED] = shippedRes.data.total
    showCount.value = true
  } catch {
    showCount.value = false
  }
}

function onTabChange(name: string | number) {
  activeTab.value = String(name)
  query.status = String(name)
  query.page = 1
  fetchData()
}

function onSearch() {
  query.page = 1
  fetchData()
}

function onReset() {
  query.page = 1
  query.size = 10
  query.shipOrderId = ''
  query.orderNo = ''
  query.userId = ''
  activeTab.value = TAB_PENDING
  query.status = TAB_PENDING
  fetchData()
}

function openShipDialog(shipOrderId: string) {
  currentShipOrderId.value = shipOrderId
  shipDialogVisible.value = true
}

async function refreshAfterStatusChanged() {
  await Promise.all([fetchStatusCount(), fetchData()])
}

onMounted(async () => {
  await Promise.all([fetchStatusCount(), fetchData()])
})
</script>

<style scoped>
.status-tabs {
  margin-bottom: 12px;
}

.filter-form {
  margin-bottom: 16px;
}

.detail-panel {
  padding: 8px 0;
}
</style>
