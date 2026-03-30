<template>
  <div class="page prizes-page">
    <el-page-header @back="router.back()" title="返回卡池列表" :content="activity?.title ?? '编辑奖品'" style="margin-bottom: 20px" />

    <el-card style="margin-bottom: 20px" v-loading="actLoading">
      <template #header><span>卡池信息</span></template>
      <template v-if="activity">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="卡池名称">{{ activity.title }}</el-descriptions-item>
          <el-descriptions-item label="活动 ID">{{ activity.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="activity.status === 1 ? 'success' : 'info'">{{ activity.status === 1 ? '上架' : '下架' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="单抽价(¥)">¥{{ activity.moneyPrice }}</el-descriptions-item>
          <el-descriptions-item label="积分价">{{ activity.scorePrice }}</el-descriptions-item>
          <el-descriptions-item label="利润率">
            <span :style="{ color: (activity.profitRate ?? 0) < 0 ? 'var(--el-color-danger)' : 'var(--el-color-success)', fontWeight: 600 }">
              {{ activity.profitRate != null ? `${activity.profitRate}%` : '-' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="连开优惠">{{ activity.multiBuyDiscount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="每用户限次">{{ activity.perUserLimit }}</el-descriptions-item>
          <el-descriptions-item label="销量">{{ activity.sales }}</el-descriptions-item>
          <el-descriptions-item label="参与用户">{{ activity.joinUserTotal }}</el-descriptions-item>
          <el-descriptions-item label="方图">
            <el-image v-if="activity.squareThumb" :src="activity.squareThumb" style="width: 60px; height: 60px" fit="cover" :preview-src-list="[activity.squareThumb]" />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ activity.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ activity.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>

    <el-card style="margin-bottom: 20px" v-loading="levelCfgLoading">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px">
          <span>奖品等级（各档百分比合计须为 100%，保存后生效）</span>
          <div style="display: flex; gap: 8px">
            <el-button size="small" @click="addLevelRow">增行</el-button>
            <el-button type="primary" size="small" :loading="levelSaveLoading" @click="saveLevelConfig">保存等级配置</el-button>
          </div>
        </div>
      </template>
      <el-table :data="levelTableRows" stripe size="small" style="width: 100%">
        <el-table-column label="标题" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.title" placeholder="如 SSR" />
          </template>
        </el-table-column>
        <el-table-column label="图标" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.icon" placeholder="可选 URL" />
          </template>
        </el-table-column>
        <el-table-column label="开盒动画" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.openBoxAnimation" placeholder="可选" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="110">
          <template #default="{ row }">
            <el-input-number v-model="row.sortOrder" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="百分比" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.tierWeight" :min="0.0001" :max="100" :precision="4" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="72" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeLevelRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p style="margin: 12px 0 0; font-size: 13px; color: var(--el-text-color-secondary)">
        当前合计：<strong :style="{ color: levelSumOk ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{ levelSumDisplay }}%</strong>
        <span v-if="!levelSumOk && levelTableRows.length > 0">（须等于 100 才能保存）</span>
      </p>
    </el-card>

    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span>奖品列表（SKU）</span>
          <el-button type="primary" @click="handleAdd">新增奖品</el-button>
        </div>
      </template>

      <el-form :inline="true" style="margin-bottom: 16px">
        <el-form-item label="名称/编码">
          <el-input v-model="query.keyword" placeholder="关键词" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="skuCode" label="SKU 编码" width="140" />
        <el-table-column prop="name" label="奖品名称" min-width="160" />
        <el-table-column label="等级" width="100">
          <template #default="{ row }">{{ row.rewardLevelTitle || '-' }}</template>
        </el-table-column>
        <el-table-column label="主图" width="72">
          <template #default="{ row }">
            <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width: 40px; height: 40px" fit="cover" :preview-src-list="[row.imageUrl]" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="成本价" width="100">
          <template #default="{ row }">{{ row.costPrice != null ? `¥${row.costPrice}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="回收价" width="100">
          <template #default="{ row }">{{ row.recyclePrice != null ? `¥${row.recyclePrice}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="概率" width="90">
          <template #default="{ row }">{{ row.rewardProbability }}%</template>
        </el-table-column>
        <el-table-column prop="stockQuantity" label="库存" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该奖品？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
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
        @current-change="fetchSkus"
        @size-change="fetchSkus"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑奖品' : '新增奖品'" width="720px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="130px">
        <el-form-item v-if="isEdit" label="SKU 编码">
          <el-input :model-value="form.skuCode" disabled />
        </el-form-item>
        <el-form-item label="奖品名称" prop="name">
          <el-input v-model="form.name" placeholder="SKU 显示名称" />
        </el-form-item>
        <el-form-item v-if="rewardLevelOptions.length > 0" label="奖品等级" prop="rewardLevelId">
          <el-select v-model="form.rewardLevelId" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="opt in rewardLevelOptions" :key="opt.id" :label="opt.title" :value="opt.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联商品" prop="selectedProductIds">
          <div style="width: 100%">
            <el-button @click="openProductPicker">选择商品</el-button>
            <span style="margin-left: 8px; color: var(--el-text-color-secondary); font-size: 13px">
              已选 {{ form.selectedProductIds.length }} 件
            </span>
            <div v-if="selectedProducts.length" style="margin-top: 8px">
              <el-tag
                v-for="p in selectedProducts"
                :key="p.id"
                closable
                style="margin: 0 6px 6px 0"
                @close="removeSelectedProduct(p.id)"
              >{{ p.name }}（{{ p.productCode }}）</el-tag>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="成本价">
          <el-input-number v-model="form.costPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="回收价">
          <el-input-number v-model="form.recyclePrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原价/划线价">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开奖概率" prop="rewardProbability">
          <el-input-number v-model="form.rewardProbability" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="特殊开奖概率" prop="specialRewardProbability">
          <el-input-number v-model="form.specialRewardProbability" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存" prop="stockQuantity">
          <el-input-number v-model="form.stockQuantity" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="主图 URL">
          <el-input v-model="form.imageUrl" placeholder="图片链接" />
        </el-form-item>
        <el-form-item label="规格属性">
          <el-input v-model="form.specAttributes" placeholder='JSON，如 {"Color":"红","Size":"M"}' />
        </el-form-item>
        <el-form-item label="开盒动画">
          <el-input v-model="form.openBoxAnimation" />
        </el-form-item>
        <el-form-item label="前面图片">
          <el-input v-model="form.frontImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="后面图片">
          <el-input v-model="form.backImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="左边图片">
          <el-input v-model="form.leftImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="右边图片">
          <el-input v-model="form.rightImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="顶部图片">
          <el-input v-model="form.topImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="底部图片">
          <el-input v-model="form.bottomImage" placeholder="URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="productPickerVisible" title="选择商品" width="860px" :close-on-click-modal="false" append-to-body>
      <el-form :inline="true" style="margin-bottom: 12px">
        <el-form-item label="商品搜索">
          <el-input v-model="productQuery.keyword" placeholder="名称/编码" clearable style="width: 200px" @keyup.enter="handleProductSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleProductSearch">查询</el-button>
          <el-button @click="handleProductResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="productTableRef"
        :data="productList"
        stripe
        style="width: 100%"
        v-loading="productListLoading"
        row-key="id"
        @selection-change="handleProductSelectionChange"
      >
        <el-table-column type="selection" width="50" :reserve-selection="true" />
        <el-table-column prop="productCode" label="商品编码" width="140" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="主图" width="72">
          <template #default="{ row }">
            <el-image v-if="row.mainImageUrl" :src="row.mainImageUrl" style="width: 40px; height: 40px" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="productQuery.page"
        v-model:page-size="productQuery.size"
        :total="productTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 12px; justify-content: flex-end"
        @current-change="fetchProductList"
        @size-change="fetchProductList"
      />
      <template #footer>
        <span style="float: left; line-height: 32px; color: var(--el-text-color-secondary)">已选择 {{ pickerSelection.length }} 件商品</span>
        <el-button @click="productPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProductPicker">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, ElTable } from 'element-plus'
import { getActivity, updateActivity } from '@/api/activity'
import { listSkus, createSku, updateSku, deleteSku } from '@/api/sku'
import { listRewardLevels, replaceRewardLevels } from '@/api/rewardLevel'
import { listProducts } from '@/api/product'
import type { ActivityVO } from '@/types/activity'
import type { SkuVO, SkuSaveRequest } from '@/types/sku'
import type { RewardLevelVO } from '@/types/rewardLevel'
import type { ProductVO } from '@/types/product'

const route = useRoute()
const router = useRouter()
const activityId = route.params.activityId as string

const actLoading = ref(false)
const activity = ref<ActivityVO | null>(null)

const levelCfgLoading = ref(false)
const levelSaveLoading = ref(false)
const levelTableRows = ref<
  { id?: string; title: string; icon?: string; openBoxAnimation?: string; sortOrder: number; tierWeight: number }[]
>([])
const rewardLevelOptions = ref<RewardLevelVO[]>([])

const levelSumDisplay = computed(() =>
  levelTableRows.value.reduce((s, r) => s + (Number(r.tierWeight) || 0), 0).toFixed(4)
)
const levelSumOk = computed(() => {
  if (levelTableRows.value.length === 0) return true
  const sum = levelTableRows.value.reduce((s, r) => s + (Number(r.tierWeight) || 0), 0)
  return Math.abs(sum - 100) <= 0.0001
})

const loading = ref(false)
const list = ref<SkuVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '' })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const productPickerVisible = ref(false)
const productListLoading = ref(false)
const productList = ref<ProductVO[]>([])
const productTotal = ref(0)
const productQuery = reactive({ page: 1, size: 10, keyword: '' })
const productTableRef = ref<InstanceType<typeof ElTable>>()
const pickerSelection = ref<ProductVO[]>([])
const allProductsMap = ref<Map<string, ProductVO>>(new Map())

const selectedProducts = computed(() =>
  form.selectedProductIds.map(id => allProductsMap.value.get(id)).filter(Boolean) as ProductVO[]
)

const form = reactive({
  skuCode: '',
  name: '',
  selectedProductIds: [] as string[],
  costPrice: undefined as number | undefined,
  recyclePrice: undefined as number | undefined,
  originalPrice: undefined as number | undefined,
  rewardProbability: 0,
  specialRewardProbability: 0,
  stockQuantity: 0,
  imageUrl: '',
  specAttributes: '',
  openBoxAnimation: '',
  frontImage: '',
  backImage: '',
  leftImage: '',
  rightImage: '',
  topImage: '',
  bottomImage: '',
  rewardLevelId: '' as string,
})

const productIdsValidator = (_rule: any, value: string[], callback: any) => {
  if (!value || value.length === 0) callback(new Error('请选择关联商品'))
  else callback()
}

const rewardLevelValidator = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (rewardLevelOptions.value.length > 0 && !value) callback(new Error('请选择奖品等级'))
  else callback()
}

const formRules: FormRules = {
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  selectedProductIds: [{ required: true, validator: productIdsValidator, trigger: 'change' }],
  rewardProbability: [{ required: true, message: '请输入开奖概率', trigger: 'blur' }],
  specialRewardProbability: [{ required: true, message: '请输入特殊开奖概率', trigger: 'blur' }],
  stockQuantity: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  rewardLevelId: [{ validator: rewardLevelValidator, trigger: 'change' }],
}

function buildPayload(): SkuSaveRequest {
  return {
    name: form.name,
    productIds: form.selectedProductIds.length > 0 ? JSON.stringify(form.selectedProductIds) : undefined,
    costPrice: form.costPrice,
    recyclePrice: form.recyclePrice,
    originalPrice: form.originalPrice,
    rewardProbability: form.rewardProbability,
    specialRewardProbability: form.specialRewardProbability,
    stockQuantity: form.stockQuantity,
    imageUrl: form.imageUrl || undefined,
    specAttributes: form.specAttributes || undefined,
    openBoxAnimation: form.openBoxAnimation || undefined,
    frontImage: form.frontImage || undefined,
    backImage: form.backImage || undefined,
    leftImage: form.leftImage || undefined,
    rightImage: form.rightImage || undefined,
    topImage: form.topImage || undefined,
    bottomImage: form.bottomImage || undefined,
    rewardLevelId: form.rewardLevelId || undefined,
  }
}

function resetForm() {
  allProductsMap.value.clear()
  Object.assign(form, {
    skuCode: '',
    name: '',
    selectedProductIds: [],
    costPrice: undefined,
    recyclePrice: undefined,
    originalPrice: undefined,
    rewardProbability: 0,
    specialRewardProbability: 0,
    stockQuantity: 0,
    imageUrl: '',
    specAttributes: '',
    openBoxAnimation: '',
    frontImage: '',
    backImage: '',
    leftImage: '',
    rightImage: '',
    topImage: '',
    bottomImage: '',
    rewardLevelId: '',
  })
}

async function rowToForm(row: SkuVO) {
  let ids: string[] = []
  if (row.productIds) {
    try { ids = JSON.parse(row.productIds) } catch { ids = [] }
  }
  if (ids.length > 0) {
    await loadProductsByIds(ids)
  }
  Object.assign(form, {
    skuCode: row.skuCode,
    name: row.name,
    selectedProductIds: ids,
    costPrice: row.costPrice ?? undefined,
    recyclePrice: row.recyclePrice ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    rewardProbability: row.rewardProbability,
    specialRewardProbability: row.specialRewardProbability,
    stockQuantity: row.stockQuantity,
    imageUrl: row.imageUrl || '',
    specAttributes: row.specAttributes || '',
    openBoxAnimation: row.openBoxAnimation || '',
    frontImage: row.frontImage || '',
    backImage: row.backImage || '',
    leftImage: row.leftImage || '',
    rightImage: row.rightImage || '',
    topImage: row.topImage || '',
    bottomImage: row.bottomImage || '',
    rewardLevelId: row.rewardLevelId || '',
  })
}

function removeSelectedProduct(id: string) {
  form.selectedProductIds = form.selectedProductIds.filter(pid => pid !== id)
  formRef.value?.validateField('selectedProductIds')
}

async function openProductPicker() {
  productPickerVisible.value = true
  productQuery.page = 1
  productQuery.keyword = ''
  await fetchProductList()
  await nextTick()
  const selectedSet = new Set(form.selectedProductIds)
  productList.value.forEach(row => {
    productTableRef.value?.toggleRowSelection(row, selectedSet.has(row.id))
  })
}

function handleProductSelectionChange(selection: ProductVO[]) {
  pickerSelection.value = selection
}

function confirmProductPicker() {
  const newIds = pickerSelection.value.map(p => p.id)
  for (const p of pickerSelection.value) {
    allProductsMap.value.set(p.id, p)
  }
  form.selectedProductIds = newIds
  formRef.value?.validateField('selectedProductIds')
  productPickerVisible.value = false
}

async function fetchProductList() {
  productListLoading.value = true
  try {
    const params: Record<string, unknown> = { page: productQuery.page, size: productQuery.size }
    if (productQuery.keyword) params.keyword = productQuery.keyword
    const { data } = await listProducts(params as any)
    productList.value = data.records
    productTotal.value = data.total
    for (const p of data.records) {
      allProductsMap.value.set(p.id, p)
    }
    await nextTick()
    const selectedSet = new Set(form.selectedProductIds)
    productList.value.forEach(row => {
      productTableRef.value?.toggleRowSelection(row, selectedSet.has(row.id))
    })
  } finally {
    productListLoading.value = false
  }
}

function handleProductSearch() {
  productQuery.page = 1
  fetchProductList()
}

function handleProductResetQuery() {
  productQuery.keyword = ''
  productQuery.page = 1
  fetchProductList()
}

async function loadProductsByIds(_ids: string[]) {
  const { data } = await listProducts({ page: 1, size: 200 })
  for (const p of data.records) {
    allProductsMap.value.set(p.id, p)
  }
}

async function recalcProfitRate() {
  if (!activity.value) return
  try {
    const { data: allSkuPage } = await listSkus(activityId, { page: 1, size: 9999 } as any)
    const allSkus = allSkuPage.records
    const expectedCost = allSkus.reduce((sum, sku) => {
      const cost = sku.costPrice ?? 0
      const prob = sku.rewardProbability ?? 0
      return sum + cost * (prob / 100)
    }, 0)
    const moneyPrice = activity.value.moneyPrice
    const profitRate = moneyPrice > 0
      ? Math.round(((moneyPrice - expectedCost) / moneyPrice) * 10000) / 100
      : 0
    await updateActivity(activityId, {
      title: activity.value.title,
      moneyPrice: activity.value.moneyPrice,
      scorePrice: activity.value.scorePrice,
      profitRate,
      perUserLimit: activity.value.perUserLimit,
    })
    activity.value.profitRate = profitRate
  } catch (e) {
    console.error('recalcProfitRate failed', e)
  }
}

async function fetchLevelConfig() {
  levelCfgLoading.value = true
  try {
    const { data } = await listRewardLevels(activityId)
    rewardLevelOptions.value = data
    levelTableRows.value = data.map(d => ({
      id: d.id,
      title: d.title,
      icon: d.icon ?? '',
      openBoxAnimation: d.openBoxAnimation ?? '',
      sortOrder: d.sortOrder,
      tierWeight: typeof d.tierWeight === 'number' ? d.tierWeight : Number(d.tierWeight),
    }))
  } finally {
    levelCfgLoading.value = false
  }
}

function addLevelRow() {
  levelTableRows.value.push({
    title: '',
    icon: '',
    openBoxAnimation: '',
    sortOrder: levelTableRows.value.length + 1,
    tierWeight: 10,
  })
}

function removeLevelRow(index: number) {
  levelTableRows.value.splice(index, 1)
}

async function saveLevelConfig() {
  if (!levelSumOk.value) {
    ElMessage.error('各档百分比之和须为 100')
    return
  }
  levelSaveLoading.value = true
  try {
    const items = levelTableRows.value.map(r => ({
      id: r.id,
      title: r.title.trim(),
      icon: r.icon?.trim() || undefined,
      openBoxAnimation: r.openBoxAnimation?.trim() || undefined,
      sortOrder: r.sortOrder,
      tierWeight: Number(r.tierWeight),
    }))
    if (items.some(i => !i.title)) {
      ElMessage.error('请填写等级标题')
      return
    }
    await replaceRewardLevels(activityId, items)
    ElMessage.success('等级配置已保存')
    await fetchLevelConfig()
  } finally {
    levelSaveLoading.value = false
  }
}

async function fetchActivity() {
  actLoading.value = true
  try {
    const { data } = await getActivity(activityId)
    activity.value = data
  } finally {
    actLoading.value = false
  }
}

async function fetchSkus() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    const { data } = await listSkus(activityId, params as any)
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchSkus()
}

function handleResetQuery() {
  query.keyword = ''
  query.page = 1
  fetchSkus()
}

async function handleAdd() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  await fetchLevelConfig()
  dialogVisible.value = true
}

async function handleEdit(row: SkuVO) {
  isEdit.value = true
  editId.value = row.id
  await fetchLevelConfig()
  await rowToForm(row)
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await updateSku(activityId, editId.value, payload)
    } else {
      await createSku(activityId, payload)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchSkus()
    recalcProfitRate()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteSku(activityId, id)
  ElMessage.success('删除成功')
  fetchSkus()
  recalcProfitRate()
}

onMounted(() => {
  fetchActivity()
  fetchSkus()
  fetchLevelConfig()
})
</script>

<style scoped>
.prizes-page {
  padding: 0;
}
</style>
