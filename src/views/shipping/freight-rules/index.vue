<template>
  <div class="page freight-rules-page">
    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px">
          <span>发货规则组</span>
          <el-button type="primary" @click="openCreate">新建规则组</el-button>
        </div>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="名称">
          <el-input v-model="query.keyword" placeholder="规则组名称关键词" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="groupName" label="规则组名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="默认运费" width="120">
          <template #default="{ row }">{{ formatYuanFromCent(row.baseFreightCent) }}</template>
        </el-table-column>
        <el-table-column label="阶梯摘要" min-width="220">
          <template #default="{ row }">{{ tierSummary(row.tiersJson) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="88">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">启用</el-tag>
            <el-tag v-else type="info" size="small">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="88" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row.id)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则组' : '新建规则组'" width="640px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="140px">
        <el-form-item label="规则组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="便于运营识别" />
        </el-form-item>
        <el-form-item label="默认运费(元)" prop="baseFreightYuan">
          <el-input-number v-model="form.baseFreightYuan" :min="0" :precision="2" :step="0.01" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="阶梯">
          <el-button size="small" @click="addTierRow">增行</el-button>
          <span style="margin-left: 8px; color: var(--el-text-color-secondary); font-size: 12px">
            件数≥门槛时取最大门槛对应运费；否则用默认运费
          </span>
        </el-form-item>
        <el-table :data="form.tiers" border size="small" style="width: 100%">
          <el-table-column label="件数≥" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.thresholdQty" :min="1" :step="1" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="运费(元)">
            <template #default="{ row }">
              <el-input-number v-model="row.freightYuan" :min="0" :precision="2" :step="0.01" controls-position="right" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="72">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="removeTierRow($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  listFreightRuleGroups,
  createFreightRuleGroup,
  getFreightRuleGroup,
  updateFreightRuleGroup,
} from '@/api/freightRule'
import type { FreightRuleGroupVO } from '@/types/freightRule'

/** 后端存分，界面用元 */
function centToYuan(cents: number | undefined | null): number {
  return Math.round(Number(cents ?? 0)) / 100
}

function yuanToCent(yuan: number): number {
  return Math.round(Number(yuan) * 100)
}

function formatYuanFromCent(cents: number | undefined | null): string {
  return `${centToYuan(cents).toFixed(2)} 元`
}

const loading = ref(false)
const submitLoading = ref(false)
const list = ref<FreightRuleGroupVO[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  size: 10,
  keyword: '',
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const form = reactive({
  groupName: '',
  baseFreightYuan: 0,
  status: 1,
  tiers: [] as { thresholdQty: number; freightYuan: number }[],
})

const formRules: FormRules = {
  groupName: [{ required: true, message: '请输入规则组名称', trigger: 'blur' }],
  baseFreightYuan: [{ required: true, message: '请输入默认运费', trigger: 'change' }],
}

function tierSummary(tiersJson: string | undefined) {
  if (!tiersJson) return '-'
  try {
    const arr = JSON.parse(tiersJson) as { thresholdQty: number; freightCent: number }[]
    if (!Array.isArray(arr) || !arr.length) return '-'
    return arr
      .map((t) => `≥${t.thresholdQty}件→${centToYuan(t.freightCent).toFixed(2)}元`)
      .join('；')
  } catch {
    return tiersJson.slice(0, 80) + (tiersJson.length > 80 ? '…' : '')
  }
}

function resetForm() {
  form.groupName = ''
  form.baseFreightYuan = 0
  form.status = 1
  form.tiers = [{ thresholdQty: 1, freightYuan: 0 }]
}

function openCreate() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  dialogVisible.value = true
}

async function openEdit(id: string) {
  isEdit.value = true
  editId.value = id
  resetForm()
  try {
    const { data } = await getFreightRuleGroup(id)
    form.groupName = data.groupName
    form.baseFreightYuan = centToYuan(data.baseFreightCent)
    form.status = data.status ?? 1
    try {
      const parsed = JSON.parse(data.tiersJson) as { thresholdQty: number; freightCent: number }[]
      form.tiers = Array.isArray(parsed) && parsed.length
        ? parsed.map((t) => ({
            thresholdQty: Math.floor(Number(t.thresholdQty)),
            freightYuan: centToYuan(t.freightCent),
          }))
        : [{ thresholdQty: 1, freightYuan: 0 }]
    } catch {
      form.tiers = [{ thresholdQty: 1, freightYuan: 0 }]
    }
    dialogVisible.value = true
  } catch {
    /* 拦截器提示 */
  }
}

function addTierRow() {
  form.tiers.push({ thresholdQty: 1, freightYuan: 0 })
}

function removeTierRow(index: number) {
  form.tiers.splice(index, 1)
}

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: query.page, size: query.size }
    if (query.keyword?.trim()) params.keyword = query.keyword.trim()
    const { data } = await listFreightRuleGroups(params as any)
    list.value = data.records ?? []
    total.value = data.total ?? 0
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
  query.page = 1
  fetchData()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!form.tiers.length) {
    ElMessage.error('至少配置一条阶梯')
    return
  }
  const tiersJson = JSON.stringify(
    form.tiers.map((t) => ({
      thresholdQty: Math.floor(Number(t.thresholdQty)),
      freightCent: yuanToCent(Number(t.freightYuan)),
    })),
  )
  const payload = {
    groupName: form.groupName.trim(),
    baseFreightCent: yuanToCent(Number(form.baseFreightYuan)),
    tiersJson,
    status: form.status,
  }
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateFreightRuleGroup(editId.value, payload)
      ElMessage.success('已更新')
    } else {
      await createFreightRuleGroup(payload)
      ElMessage.success('已创建')
    }
    dialogVisible.value = false
    await fetchData()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.freight-rules-page {
  padding: 0;
}
.filter-form {
  margin-bottom: 12px;
}
</style>
