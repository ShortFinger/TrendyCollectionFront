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
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="title" :label="labels.tableTitleColumn" min-width="160" />
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
        <el-table-column label="连开优惠" width="100">
          <template #default="{ row }">{{ row.multiBuyDiscount ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="perUserLimit" label="每用户限次" width="110" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="joinUserTotal" label="参与用户" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="(val: boolean) => handleToggleStatus(row, val)" />
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
          <el-input v-model="form.squareThumb" placeholder="square_thumb URL" />
        </el-form-item>
        <el-form-item label="长方形封面">
          <el-input v-model="form.longThumb" placeholder="long_thumb URL" />
        </el-form-item>
        <el-form-item label="轮播图">
          <el-input v-model="form.images" placeholder="多张英文逗号分隔" />
        </el-form-item>
        <el-form-item label="角标（左下）">
          <el-input v-model="form.lowerLeftCornerMark" />
        </el-form-item>
        <el-form-item label="角标（左上）">
          <el-input v-model="form.upperLeftCornerMark" />
        </el-form-item>
        <el-form-item label="角标（右下）">
          <el-input v-model="form.lowerRightCornerMark" />
        </el-form-item>
        <el-form-item label="最大箱子数" prop="boxCount">
          <el-input-number v-model="form.boxCount" :min="1" style="width: 100%" />
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
        <el-form-item label="连开优惠">
          <el-input-number v-model="form.multiBuyDiscount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开箱动画">
          <el-input v-model="form.openBoxAnimation" />
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
        <el-form-item label="专区 ID">
          <el-input v-model="form.specialAreaId" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listActivities, createActivity, updateActivity, updateActivityStatus, deleteActivity } from '@/api/activity'
import type { ActivityVO, ActivitySaveRequest } from '@/types/activity'

const props = defineProps<{
  activityType: 7 | 8
  listBasePath: string
  labels: import('./kujiListLabels').KujiListUiLabels
}>()

const router = useRouter()

const loading = ref(false)
const list = ref<ActivityVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, keyword: '', status: undefined as number | undefined })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  title: '',
  squareThumb: '',
  longThumb: '',
  lowerLeftCornerMark: '',
  upperLeftCornerMark: '',
  lowerRightCornerMark: '',
  images: '',
  boxCount: 1,
  moneyPrice: 0,
  scorePrice: 0,
  profitRate: 0,
  perUserLimit: 1,
  multiBuyDiscount: 0,
  openBoxAnimation: '',
  tags: '',
  rank: 0 as 0 | 1,
  amountLimit: 0,
  specialAreaId: '',
  isRandomRewardEnabled: 0 as 0 | 1,
})

const formRules = computed<FormRules>(() => ({
  title: [{ required: true, message: props.labels.formTitleRuleMessage, trigger: 'blur' }],
  boxCount: [{ required: true, message: '请输入最大箱子数', trigger: 'blur' }],
  moneyPrice: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  scorePrice: [{ required: true, message: '请输入积分价格', trigger: 'blur' }],
  perUserLimit: [{ required: true, message: '请输入限次', trigger: 'blur' }],
}))

function buildSavePayload(): ActivitySaveRequest {
  return {
    title: form.title,
    activityType: props.activityType,
    boxCount: form.boxCount,
    squareThumb: form.squareThumb || undefined,
    longThumb: form.longThumb || undefined,
    lowerLeftCornerMark: form.lowerLeftCornerMark || undefined,
    upperLeftCornerMark: form.upperLeftCornerMark || undefined,
    lowerRightCornerMark: form.lowerRightCornerMark || undefined,
    images: form.images || undefined,
    moneyPrice: form.moneyPrice,
    scorePrice: form.scorePrice,
    perUserLimit: form.perUserLimit,
    multiBuyDiscount: form.multiBuyDiscount,
    openBoxAnimation: form.openBoxAnimation || undefined,
    tags: form.tags || undefined,
    rank: form.rank,
    amountLimit: form.amountLimit,
    specialAreaId: form.specialAreaId || undefined,
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
    lowerRightCornerMark: '',
    images: '',
    boxCount: 1,
    moneyPrice: 0,
    scorePrice: 0,
    profitRate: 0,
    perUserLimit: 1,
    multiBuyDiscount: 0,
    openBoxAnimation: '',
    tags: '',
    rank: 0,
    amountLimit: 0,
    specialAreaId: '',
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
    lowerRightCornerMark: row.lowerRightCornerMark || '',
    images: row.images || '',
    boxCount: row.boxCount ?? 1,
    moneyPrice: row.moneyPrice,
    scorePrice: row.scorePrice,
    profitRate: row.profitRate ?? 0,
    perUserLimit: row.perUserLimit,
    multiBuyDiscount: row.multiBuyDiscount ?? 0,
    openBoxAnimation: row.openBoxAnimation || '',
    tags: row.tags || '',
    rank: (row.rank === 1 ? 1 : 0) as 0 | 1,
    amountLimit: row.amountLimit ?? 0,
    specialAreaId: row.specialAreaId || '',
    isRandomRewardEnabled: (row.isRandomRewardEnabled === 1 ? 1 : 0) as 0 | 1,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: query.page, size: query.size, activityType: props.activityType }
    if (query.keyword) params.keyword = query.keyword
    if (query.status !== undefined) params.status = query.status
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
  query.page = 1
  fetchData()
}

function goToBoxes(row: ActivityVO) {
  router.push({ path: `${props.listBasePath}/${row.id}/boxes` })
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: ActivityVO) {
  isEdit.value = true
  editId.value = row.id
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
      await createActivity(payload)
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleToggleStatus(row: ActivityVO, val: boolean) {
  await updateActivityStatus(row.id, { status: val ? 1 : 0 })
  ElMessage.success(val ? '已上架' : '已下架')
  fetchData()
}

async function handleDelete(id: string) {
  await deleteActivity(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
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
</style>
