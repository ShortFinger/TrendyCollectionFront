<template>
  <div class="page kuji-activity-list">
    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span>{{ labels.pageTitle }}</span>
          <el-button type="primary" @click="handleAdd">{{ labels.addButton }}</el-button>
        </div>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item :label="labels.keywordFilterLabel">
          <el-input v-model="query.keyword" :placeholder="labels.keywordPlaceholder" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="上架" value="ON_SHELF" />
            <el-option label="下架" value="OFF_SHELF" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="query.categoryId" placeholder="全部" clearable filterable style="width: 200px">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.title" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="title" :label="labels.tableTitleColumn" min-width="160" />
        <el-table-column label="分类" width="140">
          <template #default="{ row }">{{ row.categoryTitle || '-' }}</template>
        </el-table-column>
        <el-table-column label="方图" width="72">
          <template #default="{ row }">
            <el-image v-if="row.squareThumb" :src="row.squareThumb" style="width: 40px; height: 40px" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="单抽价(¥)" width="110">
          <template #default="{ row }">¥{{ row.moneyPrice }}</template>
        </el-table-column>
        <el-table-column label="积分价" width="100">
          <template #default="{ row }">{{ row.scorePrice }}</template>
        </el-table-column>
        <el-table-column label="利润率" width="100">
          <template #default="{ row }">{{ row.profitRate }}%</template>
        </el-table-column>
        <el-table-column label="最大箱子数" width="110" align="center">
          <template #default="{ row }">{{ row.boxCount != null ? row.boxCount : '-' }}</template>
        </el-table-column>
        <el-table-column label="编辑箱子" width="110">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goToBoxes(row)">编辑箱子</el-button>
          </template>
        </el-table-column>
        <el-table-column label="连抽档位" min-width="200">
          <template #default="{ row }">
            <div class="tier-list-cell">
              <span class="tier-list-cell__summary">{{ formatTierSummary(row) }}</span>
              <el-button link type="primary" size="small" @click="openTierDialog(row)">连抽设置</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="perUserLimit" label="每用户限次" width="110" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="joinUserTotal" label="参与用户" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 'ON_SHELF'" @change="(val: boolean) => handleToggleStatus(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm :title="labels.deleteConfirm" @confirm="handleDelete(row.id)">
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
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? labels.dialogEditTitle : labels.dialogAddTitle"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item :label="labels.formTitleLabel" prop="title">
          <el-input v-model="form.title" :placeholder="labels.formTitlePlaceholder" />
        </el-form-item>
        <el-form-item label="正方形封面">
          <MediaUpload v-model="form.squareThumb" :dir="uploadDir('square-thumb')" />
        </el-form-item>
        <el-form-item label="长方形封面">
          <MediaUpload v-model="form.longThumb" :dir="uploadDir('long-thumb')" />
        </el-form-item>
        <el-form-item label="轮播图">
          <MediaUpload v-model="form.images" :dir="uploadDir('images')" />
        </el-form-item>
                <el-form-item label="角标（左上）">
          <MediaUpload v-model="form.upperLeftCornerMark" :dir="uploadDir('corner-marks')" />
        </el-form-item>
        <el-form-item label="角标（右上）">
          <MediaUpload v-model="form.upperRightCornerMark" :dir="uploadDir('corner-marks')" />
        </el-form-item>
        <el-form-item label="角标（左下）">
          <MediaUpload v-model="form.lowerLeftCornerMark" :dir="uploadDir('corner-marks')" />
        </el-form-item>
        <el-form-item label="角标（右下）">
          <MediaUpload v-model="form.lowerRightCornerMark" :dir="uploadDir('corner-marks')" />
        </el-form-item>
        <el-form-item label="最大箱子数" prop="boxCount">
          <el-input-number v-model="form.boxCount" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="props.activityType === 'ICHIBAN'" label="最终赏 SKU ID">
          <el-input v-model="form.finalPrizeSkuId" placeholder="留空表示不开启；须为活动内已创建 SKU" clearable />
        </el-form-item>
        <el-form-item label="人民币价格" prop="moneyPrice">
          <el-input-number v-model="form.moneyPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="积分价格" prop="scorePrice">
          <el-input-number v-model="form.scorePrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="利润率（%）">
          <el-input :model-value="form.profitRate + '%'" disabled />
          <span class="hint">由系统根据 SKU 成本自动计算</span>
        </el-form-item>
        <el-form-item label="每用户限次" prop="perUserLimit">
          <el-input-number v-model="form.perUserLimit" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="连抽档位">
          <MultiDrawTierEditor v-model="form.multiDrawTiers" />
        </el-form-item>
        <el-form-item label="开箱动画">
          <MediaUpload v-model="form.openBoxAnimation" accept="video" :dir="uploadDir('open-box-animation')" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" />
        </el-form-item>
        <el-form-item label="开启榜单">
          <el-switch v-model="form.rank" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="实付金额门槛">
          <el-input-number v-model="form.amountLimit" :min="0" style="width: 100%" />
          <span class="hint">0 表示无限制</span>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="form.categoryId" placeholder="不选则无分类" clearable filterable style="width: 100%">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.title" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="随机赠送">
          <el-switch v-model="form.isRandomRewardEnabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="tierDialogVisible"
      title="连抽设置"
      width="720px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="tierDialogLoading" style="min-height: 120px">
        <MultiDrawTierEditor v-if="!tierDialogLoading && tierDialogVo" v-model="tierDialogTiers" />
      </div>
      <template #footer>
        <el-button @click="tierDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="tierDialogSaveLoading" :disabled="!tierDialogVo" @click="saveTierDialog">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  listActivities,
  createActivity,
  updateActivity,
  updateActivityStatus,
  deleteActivity,
  getActivity,
} from '@/api/activity'
import { listCategories } from '@/api/category'
import type { ActivityVO, ActivitySaveRequest, MultiDrawTierItem } from '@/types/activity'
import type { CategoryVO } from '@/types/category'
import MultiDrawTierEditor from '@/components/MultiDrawTierEditor.vue'
import MediaUpload from '@/components/MediaUpload.vue'
import {
  activityVoToSaveRequest,
  cloneTiersForSave,
  defaultMultiDrawTiers,
  formatTierSummary,
} from '@/utils/activityMultiDraw'
import { moveFiles } from '@/api/oss'

const props = defineProps<{
  activityType: 'ICHIBAN' | 'UNLIMITED'
  listBasePath: string
  labels: import('./kujiListLabels').KujiListUiLabels
}>()

const router = useRouter()

const tierDialogVisible = ref(false)
const tierDialogLoading = ref(false)
const tierDialogSaveLoading = ref(false)
const tierDialogVo = ref<ActivityVO | null>(null)
const tierDialogTiers = ref<MultiDrawTierItem[]>([])

const loading = ref(false)
const list = ref<ActivityVO[]>([])
const total = ref(0)
const categoryOptions = ref<CategoryVO[]>([])
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: undefined as string | undefined,
  categoryId: undefined as string | undefined,
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const tempId = ref('')

const form = reactive({
  title: '',
  squareThumb: '',
  longThumb: '',
  lowerLeftCornerMark: '',
  upperLeftCornerMark: '',
  upperRightCornerMark: '',
  lowerRightCornerMark: '',
  images: '',
  boxCount: 1,
  finalPrizeSkuId: '',
  moneyPrice: 0,
  scorePrice: 0,
  profitRate: 0,
  perUserLimit: 1,
  multiDrawTiers: defaultMultiDrawTiers(),
  openBoxAnimation: '',
  tags: '',
  rank: 0 as 0 | 1,
  amountLimit: 0,
  categoryId: undefined as string | undefined,
  isRandomRewardEnabled: 0 as 0 | 1,
})

const formRules = computed<FormRules>(() => ({
  title: [{ required: true, message: props.labels.formTitleRuleMessage, trigger: 'blur' }],
  boxCount: [{ required: true, message: '请输入最大箱子数', trigger: 'blur' }],
  moneyPrice: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  scorePrice: [{ required: true, message: '请输入积分价格', trigger: 'blur' }],
  perUserLimit: [{ required: true, message: '请输入限次', trigger: 'blur' }],
}))

function uploadDir(field: string) {
  const dirPrefix = props.activityType.toLowerCase()
  if (isEdit.value) {
    return `${dirPrefix}/${editId.value}/${field}`
  }
  return `temp/${tempId.value}/${field}`
}

function buildSavePayload(): ActivitySaveRequest {
  return {
    title: form.title,
    activityType: props.activityType,
    boxCount: form.boxCount,
    finalPrizeSkuId:
      props.activityType === 'ICHIBAN' && form.finalPrizeSkuId.trim() !== '' ? form.finalPrizeSkuId.trim() : undefined,
    squareThumb: form.squareThumb || undefined,
    longThumb: form.longThumb || undefined,
    lowerLeftCornerMark: form.lowerLeftCornerMark || undefined,
    upperLeftCornerMark: form.upperLeftCornerMark || undefined,
    upperRightCornerMark: form.upperRightCornerMark || undefined,
    lowerRightCornerMark: form.lowerRightCornerMark || undefined,
    images: form.images || undefined,
    moneyPrice: form.moneyPrice,
    scorePrice: form.scorePrice,
    perUserLimit: form.perUserLimit,
    multiDrawTiers: cloneTiersForSave(form.multiDrawTiers),
    openBoxAnimation: form.openBoxAnimation || undefined,
    tags: form.tags || undefined,
    rank: form.rank,
    amountLimit: form.amountLimit,
    categoryId:
      form.categoryId !== undefined && form.categoryId !== null && String(form.categoryId).trim() !== ''
        ? String(form.categoryId).trim()
        : undefined,
    isRandomRewardEnabled: form.isRandomRewardEnabled,
  }
}

function resetForm() {
  Object.assign(form, {
    title: '',
    squareThumb: '',
    longThumb: '',
    lowerLeftCornerMark: '',
    upperLeftCornerMark: '',
    upperRightCornerMark: '',
    lowerRightCornerMark: '',
    images: '',
    boxCount: 1,
    finalPrizeSkuId: '',
    moneyPrice: 0,
    scorePrice: 0,
    profitRate: 0,
    perUserLimit: 1,
    multiDrawTiers: defaultMultiDrawTiers(),
    openBoxAnimation: '',
    tags: '',
    rank: 0,
    amountLimit: 0,
    categoryId: undefined,
    isRandomRewardEnabled: 0,
  })
}

function rowToForm(row: ActivityVO) {
  Object.assign(form, {
    title: row.title,
    squareThumb: row.squareThumb || '',
    longThumb: row.longThumb || '',
    lowerLeftCornerMark: row.lowerLeftCornerMark || '',
    upperLeftCornerMark: row.upperLeftCornerMark || '',
    upperRightCornerMark: row.upperRightCornerMark || '',
    lowerRightCornerMark: row.lowerRightCornerMark || '',
    images: row.images || '',
    boxCount: row.boxCount ?? 1,
    finalPrizeSkuId: row.finalPrizeSkuId || '',
    moneyPrice: row.moneyPrice,
    scorePrice: row.scorePrice,
    profitRate: row.profitRate ?? 0,
    perUserLimit: row.perUserLimit,
    multiDrawTiers:
      row.multiDrawTiers?.length && row.multiDrawTiers.length > 0
        ? JSON.parse(JSON.stringify(row.multiDrawTiers))
        : defaultMultiDrawTiers(),
    openBoxAnimation: row.openBoxAnimation || '',
    tags: row.tags || '',
    rank: (row.rank === 1 ? 1 : 0) as 0 | 1,
    amountLimit: row.amountLimit ?? 0,
    categoryId:
      row.categoryId != null && String(row.categoryId).trim() !== '' ? String(row.categoryId).trim() : undefined,
    isRandomRewardEnabled: (row.isRandomRewardEnabled === 1 ? 1 : 0) as 0 | 1,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: query.page, size: query.size, activityType: props.activityType }
    if (query.keyword) params.keyword = query.keyword
    if (query.status !== undefined) params.status = query.status
    if (query.categoryId !== undefined && query.categoryId !== null && String(query.categoryId).trim() !== '') {
      params.categoryId = String(query.categoryId).trim()
    }
    const { data } = await listActivities(params as any)
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
  query.keyword = ''
  query.status = undefined
  query.categoryId = undefined
  query.page = 1
  fetchData()
}

async function loadCategories() {
  const { data } = await listCategories({ page: 1, size: 200 })
  categoryOptions.value = data.records
}

function goToBoxes(row: ActivityVO) {
  router.push({ path: `${props.listBasePath}/${row.id}/boxes` })
}

async function openTierDialog(row: ActivityVO) {
  tierDialogVisible.value = true
  tierDialogLoading.value = true
  tierDialogVo.value = null
  tierDialogTiers.value = []
  try {
    const { data } = await getActivity(row.id)
    tierDialogVo.value = data
    tierDialogTiers.value =
      data.multiDrawTiers?.length && data.multiDrawTiers.length > 0
        ? JSON.parse(JSON.stringify(data.multiDrawTiers))
        : defaultMultiDrawTiers()
  } catch {
    ElMessage.error('加载活动详情失败')
    tierDialogVisible.value = false
  } finally {
    tierDialogLoading.value = false
  }
}

async function saveTierDialog() {
  const vo = tierDialogVo.value
  if (!vo) return
  tierDialogSaveLoading.value = true
  try {
    await updateActivity(
      vo.id,
      activityVoToSaveRequest(vo, { multiDrawTiers: cloneTiersForSave(tierDialogTiers.value) }),
    )
    ElMessage.success('连抽档位已保存')
    tierDialogVisible.value = false
    fetchData()
  } finally {
    tierDialogSaveLoading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  tempId.value = crypto.randomUUID()
  dialogVisible.value = true
}

function handleEdit(row: ActivityVO) {
  isEdit.value = true
  editId.value = row.id
  tempId.value = ''
  rowToForm(row)
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const payload = buildSavePayload()
    if (isEdit.value) {
      await updateActivity(editId.value, payload)
    } else {
      const { data } = await createActivity(payload)
      const activityId = typeof data === 'object' && data !== null && 'id' in data ? (data as any).id : data
      const dirPrefix = props.activityType.toLowerCase()
      const fieldMapping: Record<string, string> = {
        'square-thumb': 'squareThumb',
        'long-thumb': 'longThumb',
        'images': 'images',
        'corner-marks': 'lowerLeftCornerMark',
        'open-box-animation': 'openBoxAnimation',
      }
      const usedFields = Object.entries(fieldMapping)
        .filter(([, formKey]) => {
          if (formKey === 'lowerLeftCornerMark') {
            return !!(
              form.lowerLeftCornerMark ||
              form.upperLeftCornerMark ||
              form.upperRightCornerMark ||
              form.lowerRightCornerMark
            )
          }
          return !!(form as any)[formKey]
        })
        .map(([field]) => field)
      if (usedFields.length > 0) {
        await moveFiles({
          tempId: tempId.value,
          targetDir: `${dirPrefix}/${activityId}`,
          fields: usedFields,
        })
      }
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleToggleStatus(row: ActivityVO, val: boolean) {
  await updateActivityStatus(row.id, { status: val ? 'ON_SHELF' : 'OFF_SHELF' })
  ElMessage.success(val ? '已上架' : '已下架')
  fetchData()
}

async function handleDelete(id: string) {
  await deleteActivity(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(() => {
  void loadCategories()
  void fetchData()
})
</script>

<style scoped>
.kuji-activity-list .filter-form {
  margin-bottom: 16px;
}
.kuji-activity-list .hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.tier-list-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tier-list-cell__summary {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
