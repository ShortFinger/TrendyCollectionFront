<template>
  <div class="page virtual-users-page">
    <el-card>
      <template #header>
        <span>虚拟用户</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="昵称">
          <el-input v-model="query.keyword" placeholder="模糊匹配" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 0, 1, 0, 0, 0), new Date(2000, 0, 1, 23, 59, 59)]"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openCreate">新建</el-button>
          <el-button type="warning" @click="openBatch">批量生成</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="nickname" label="昵称" min-width="100" />
        <el-table-column prop="status" label="状态" width="72">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
        <el-table-column prop="paidMoneyTotal" label="累计支付额" width="100" />
        <el-table-column prop="scoreBalance" label="积分余额" width="90" />
        <el-table-column prop="luckyScore" label="欧气" width="72" />
        <el-table-column prop="mithrilBalance" label="秘银" width="72" />
        <el-table-column prop="profileSource" label="来源" width="88" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="editVisible" :title="editId ? '编辑虚拟用户' : '新建虚拟用户'" width="560px" destroy-on-close>
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="昵称" required>
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="头像 URL">
          <el-input v-model="editForm.avatar" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editForm.tags" />
        </el-form-item>
        <el-form-item label="累计支付金额">
          <el-input-number v-model="editForm.paidMoneyTotal" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="累计支付积分">
          <el-input-number v-model="editForm.paidScoreTotal" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="积分余额">
          <el-input-number v-model="editForm.scoreBalance" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="欧气值">
          <el-input-number v-model="editForm.luckyScore" controls-position="right" />
        </el-form-item>
        <el-form-item label="秘银余额">
          <el-input-number v-model="editForm.mithrilBalance" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchVisible" title="批量生成" width="480px" destroy-on-close>
      <el-form :model="batchForm" label-width="140px">
        <el-form-item label="数量" required>
          <el-input-number v-model="batchForm.count" :min="1" :max="500" />
        </el-form-item>
        <el-form-item label="昵称前缀" required>
          <el-input v-model="batchForm.nicknamePrefix" placeholder="如 水军_" />
        </el-form-item>
        <el-form-item label="欧气随机上限">
          <el-input-number v-model="batchForm.luckyScoreMaxInclusive" :min="0" controls-position="right" />
          <span class="hint">有值则忽略下方固定欧气</span>
        </el-form-item>
        <el-form-item label="固定欧气">
          <el-input-number v-model="batchForm.luckyScore" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBatch">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listVirtualUsers,
  createVirtualUser,
  updateVirtualUser,
  deleteVirtualUser,
  batchGenerateVirtualUsers,
} from '@/api/virtual-user'
import type { VirtualUserVO } from '@/types/virtual-user'

const loading = ref(false)
const list = ref<VirtualUserVO[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)
const statusFilter = ref<number | undefined>(undefined)

const query = reactive({
  page: 1,
  size: 10,
  keyword: '' as string | undefined,
})

watch(statusFilter, () => {
  query.page = 1
})

const editVisible = ref(false)
const editId = ref<string | null>(null)
const editForm = reactive({
  nickname: '',
  avatar: '',
  status: 1,
  tags: '',
  paidMoneyTotal: 0,
  paidScoreTotal: 0,
  scoreBalance: 0,
  scoreTotalEarned: 0,
  scoreTotalDeducted: 0,
  luckyScore: 0,
  mithrilBalance: 0,
  mithrilTotalEarned: 0,
  mithrilTotalDeducted: 0,
})

const batchVisible = ref(false)
const batchForm = reactive({
  count: 10,
  nicknamePrefix: 'v_',
  luckyScoreMaxInclusive: undefined as number | undefined,
  luckyScore: 0,
})

function timeParams() {
  if (dateRange.value?.length === 2) {
    return { createStartTime: dateRange.value[0], createEndTime: dateRange.value[1] }
  }
  return {}
}

async function fetchData() {
  loading.value = true
  try {
    const res = await listVirtualUsers({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: statusFilter.value,
      ...timeParams(),
    })
    const data = res.data
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
  query.keyword = ''
  query.page = 1
  query.size = 10
  statusFilter.value = undefined
  dateRange.value = null
  fetchData()
}

function openCreate() {
  editId.value = null
  Object.assign(editForm, {
    nickname: '',
    avatar: '',
    status: 1,
    tags: '',
    paidMoneyTotal: 0,
    paidScoreTotal: 0,
    scoreBalance: 0,
    scoreTotalEarned: 0,
    scoreTotalDeducted: 0,
    luckyScore: 0,
    mithrilBalance: 0,
    mithrilTotalEarned: 0,
    mithrilTotalDeducted: 0,
  })
  editVisible.value = true
}

function openEdit(row: VirtualUserVO) {
  editId.value = row.id
  Object.assign(editForm, {
    nickname: row.nickname,
    avatar: row.avatar ?? '',
    status: row.status,
    tags: row.tags ?? '',
    paidMoneyTotal: row.paidMoneyTotal ?? 0,
    paidScoreTotal: row.paidScoreTotal ?? 0,
    scoreBalance: row.scoreBalance ?? 0,
    scoreTotalEarned: row.scoreTotalEarned ?? 0,
    scoreTotalDeducted: row.scoreTotalDeducted ?? 0,
    luckyScore: row.luckyScore ?? 0,
    mithrilBalance: row.mithrilBalance ?? 0,
    mithrilTotalEarned: row.mithrilTotalEarned ?? 0,
    mithrilTotalDeducted: row.mithrilTotalDeducted ?? 0,
  })
  editVisible.value = true
}

async function submitEdit() {
  if (!editForm.nickname.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  if (editId.value) {
    await updateVirtualUser(editId.value, { ...editForm })
    ElMessage.success('已保存')
  } else {
    await createVirtualUser({ ...editForm })
    ElMessage.success('已创建')
  }
  editVisible.value = false
  fetchData()
}

async function handleDelete(row: VirtualUserVO) {
  await ElMessageBox.confirm(`删除虚拟用户「${row.nickname}」？`, '确认', { type: 'warning' })
  await deleteVirtualUser(row.id)
  ElMessage.success('已删除')
  fetchData()
}

function openBatch() {
  batchForm.count = 10
  batchForm.nicknamePrefix = 'v_'
  batchForm.luckyScoreMaxInclusive = undefined
  batchForm.luckyScore = 0
  batchVisible.value = true
}

async function submitBatch() {
  if (!batchForm.nicknamePrefix.trim()) {
    ElMessage.warning('请填写昵称前缀')
    return
  }
  const res = await batchGenerateVirtualUsers({
    count: batchForm.count,
    nicknamePrefix: batchForm.nicknamePrefix.trim(),
    luckyScoreMaxInclusive: batchForm.luckyScoreMaxInclusive,
    luckyScore: batchForm.luckyScore,
  })
  ElMessage.success(`已生成 ${res.data.created} 条`)
  batchVisible.value = false
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
}
.hint {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
