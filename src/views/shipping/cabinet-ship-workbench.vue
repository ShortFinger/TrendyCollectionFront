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

      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="shipOrderId" label="申请单ID" min-width="180" />
        <el-table-column prop="orderNo" label="申请单号" min-width="180" />
        <el-table-column prop="userId" label="用户ID" width="160" />
        <el-table-column prop="assetCount" label="资产数" width="90" />
        <el-table-column prop="status" label="状态" width="150" />
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
              @click="openShipDialog(row.shipOrderId)"
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
import { listCabinetShipOrders } from '@/api/cabinetShip'
import type { CabinetShipOrderItem, CabinetShipOrderQueryRequest } from '@/types/cabinetShip'
import ShipConfirmDialog from '@/components/shipping/ShipConfirmDialog.vue'

const TAB_PENDING = 'PENDING_REVIEW'
const TAB_SHIPPED = 'SHIPPED'

const loading = ref(false)
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
</style>
