<template>
  <div class="page coupon-page">
    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span>优惠券管理</span>
          <el-button type="primary" @click="router.push('/coupon/create')">+ 新建优惠券</el-button>
        </div>
      </template>

      <el-form :inline="true" class="filter-form">
        <el-form-item label="券名称">
          <el-input v-model="query.name" placeholder="请输入券名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="券类型">
          <el-select v-model="query.couponType" placeholder="全部" clearable style="width: 130px">
            <el-option label="现金券" value="CASH" />
            <el-option label="折扣券" value="DISCOUNT" />
            <el-option label="包邮券" value="FREE_SHIPPING" />
            <el-option label="兑换券" value="EXCHANGE" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已启用" value="ACTIVE" />
            <el-option label="已停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="券名称" min-width="160" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="couponTypeTag(row.couponType).type" size="small">
              {{ couponTypeTag(row.couponType).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="面值/折扣" min-width="160">
          <template #default="{ row }">
            {{ formatDiscount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="使用范围" width="110">
          <template #default="{ row }">
            {{ scopeLabel(row.scopeType) }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="200">
          <template #default="{ row }">
            <template v-if="row.validityType === 'FIXED'">{{ row.validStart }} - {{ row.validEnd }}</template>
            <template v-else>领取后{{ row.validDays }}天</template>
          </template>
        </el-table-column>
        <el-table-column label="领取量/总量" width="130">
          <template #default="{ row }">
            {{ row.claimedCount }} / {{ row.totalCount === -1 ? '不限量' : row.totalCount }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status).type" size="small">
              {{ statusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="router.push(`/coupon/edit/${row.id}`)">编辑</el-button>
            <el-button
              v-if="row.status !== 'ACTIVE'"
              link type="success" size="small"
              @click="handleToggleStatus(row, 'ACTIVE')"
            >启用</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              link type="warning" size="small"
              @click="handleToggleStatus(row, 'DISABLED')"
            >停用</el-button>
            <el-button
              v-if="row.status === 'ACTIVE'"
              link type="primary" size="small"
              @click="openDistribute(row)"
            >发放</el-button>
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

    <el-dialog v-model="distributeVisible" title="发放优惠券" width="500px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="优惠券">
          <span>{{ distributeTemplateName }}</span>
        </el-form-item>
        <el-form-item label="用户ID列表">
          <el-input
            v-model="distributeUserIds"
            type="textarea"
            :rows="4"
            placeholder="多个用户ID用逗号分隔"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="distributeVisible = false">取消</el-button>
        <el-button type="primary" :loading="distributeLoading" @click="confirmDistribute">确定发放</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listCouponTemplates, updateCouponTemplateStatus, distributeCoupon } from '@/api/coupon'
import type { CouponTemplateVO } from '@/types/coupon'

const router = useRouter()
const loading = ref(false)
const list = ref<CouponTemplateVO[]>([])
const total = ref(0)

const query = reactive({
  page: 1,
  size: 10,
  name: '',
  couponType: '' as string,
  status: '' as string,
})

const distributeVisible = ref(false)
const distributeLoading = ref(false)
const distributeTemplateId = ref(0)
const distributeTemplateName = ref('')
const distributeUserIds = ref('')

function couponTypeTag(type: string) {
  const map: Record<string, { label: string; type: string }> = {
    CASH: { label: '现金券', type: 'success' },
    DISCOUNT: { label: '折扣券', type: 'warning' },
    FREE_SHIPPING: { label: '包邮券', type: '' },
    EXCHANGE: { label: '兑换券', type: 'danger' },
  }
  return map[type] || { label: type, type: 'info' }
}

function formatDiscount(row: CouponTemplateVO) {
  switch (row.couponType) {
    case 'CASH':
      return `¥${((row.discountValue || 0) / 100).toFixed(2)}`
    case 'DISCOUNT':
      return `${(row.discountValue || 0) / 10}折 (上限¥${((row.discountCap || 0) / 100).toFixed(2)})`
    case 'FREE_SHIPPING':
      return '免运费'
    case 'EXCHANGE':
      return '指定商品'
    default:
      return '-'
  }
}

function scopeLabel(scope: string) {
  const map: Record<string, string> = {
    ALL: '全场通用',
    ACTIVITY: '指定活动',
    PRODUCT: '指定商品',
  }
  return map[scope] || scope
}

function statusTag(status: string) {
  const map: Record<string, { label: string; type: string }> = {
    DRAFT: { label: '草稿', type: 'info' },
    ACTIVE: { label: '已启用', type: 'success' },
    DISABLED: { label: '已停用', type: 'danger' },
  }
  return map[status] || { label: status, type: 'info' }
}

async function fetchData() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.name) params.name = query.name
    if (query.couponType) params.couponType = query.couponType
    if (query.status) params.status = query.status
    const { data } = await listCouponTemplates(params)
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
  query.name = ''
  query.couponType = ''
  query.status = ''
  query.page = 1
  fetchData()
}

async function handleToggleStatus(row: CouponTemplateVO, newStatus: string) {
  const actionLabel = newStatus === 'ACTIVE' ? '启用' : '停用'
  await ElMessageBox.confirm(`确定${actionLabel}「${row.name}」？`, '提示', { type: 'warning' })
  await updateCouponTemplateStatus(row.id, newStatus)
  ElMessage.success(`已${actionLabel}`)
  fetchData()
}

function openDistribute(row: CouponTemplateVO) {
  distributeTemplateId.value = row.id
  distributeTemplateName.value = row.name
  distributeUserIds.value = ''
  distributeVisible.value = true
}

async function confirmDistribute() {
  const ids = distributeUserIds.value
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!ids.length) {
    ElMessage.warning('请输入用户ID')
    return
  }
  distributeLoading.value = true
  try {
    await distributeCoupon({ templateId: distributeTemplateId.value, userIds: ids })
    ElMessage.success('发放成功')
    distributeVisible.value = false
    fetchData()
  } finally {
    distributeLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.coupon-page .filter-form {
  margin-bottom: 16px;
}
</style>
