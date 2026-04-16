<template>
  <div class="page virtual-user-rules-page">
    <el-card>
      <template #header>
        <span>虚拟用户投放规则</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="活动ID">
          <el-input v-model="query.campaignId" placeholder="campaignId" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则名">
          <el-input v-model="query.keyword" placeholder="模糊" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="openCreate">新建</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="ruleName" label="名称" min-width="120" />
        <el-table-column prop="campaignId" label="活动ID" width="160" show-overflow-tooltip />
        <el-table-column prop="userSelectType" label="选人类型" width="110" />
        <el-table-column prop="joinProbability" label="概率%" width="72" />
        <el-table-column prop="startTime" label="开始" width="170" />
        <el-table-column prop="endTime" label="结束" width="170" />
        <el-table-column prop="status" label="状态" width="72">
          <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="72" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 1"
              link
              type="warning"
              size="small"
              @click="patchStatus(row, 0)"
            >
              停用
            </el-button>
            <el-button v-else link type="success" size="small" @click="patchStatus(row, 1)">启用</el-button>
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

    <el-dialog v-model="editVisible" :title="editId ? '编辑规则' : '新建规则'" width="640px" destroy-on-close>
      <el-form :model="editForm" label-width="130px">
        <el-form-item label="活动ID" required>
          <el-input v-model="editForm.campaignId" />
        </el-form-item>
        <el-form-item label="规则名称" required>
          <el-input v-model="editForm.ruleName" />
        </el-form-item>
        <el-form-item label="选人类型" required>
          <el-select v-model="editForm.userSelectType" style="width: 100%">
            <el-option label="MANUAL_IDS" value="MANUAL_IDS" />
            <el-option label="TAG_POOL" value="TAG_POOL" />
            <el-option label="RANDOM_POOL" value="RANDOM_POOL" />
          </el-select>
        </el-form-item>
        <el-form-item label="选人 JSON" required>
          <el-input v-model="editForm.userSelectConfig" type="textarea" :rows="4" placeholder='如 {"ids":["id1"]}' />
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-input v-model="editForm.startTime" placeholder="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-input v-model="editForm.endTime" placeholder="yyyy-MM-dd HH:mm:ss" />
        </el-form-item>
        <el-form-item label="时段 JSON">
          <el-input
            v-model="editForm.activeHours"
            type="textarea"
            :rows="2"
            placeholder='可选 [{"startHour":9,"endHour":22}]'
          />
        </el-form-item>
        <el-form-item label="参与概率 0-100">
          <el-input-number v-model="editForm.joinProbability" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="间隔秒 min/max">
          <el-input-number v-model="editForm.intervalMinSeconds" :min="0" style="width: 120px" />
          <span class="mx-2">—</span>
          <el-input-number v-model="editForm.intervalMaxSeconds" :min="0" style="width: 120px" />
        </el-form-item>
        <el-form-item label="每日上限/用户">
          <el-input-number v-model="editForm.dailyCapPerUser" :min="0" />
        </el-form-item>
        <el-form-item label="事件 JSON" required>
          <el-input
            v-model="editForm.eventTypeConfig"
            type="textarea"
            :rows="3"
            placeholder='{"eventType":"JOIN","luckyScoreDelta":1}'
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="editForm.priority" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listVirtualUserCampaignRules,
  createVirtualUserCampaignRule,
  updateVirtualUserCampaignRule,
  deleteVirtualUserCampaignRule,
  patchVirtualUserCampaignRuleStatus,
} from '@/api/virtual-user'
import type { VirtualUserCampaignRuleVO } from '@/types/virtual-user'

const loading = ref(false)
const list = ref<VirtualUserCampaignRuleVO[]>([])
const total = ref(0)
const statusFilter = ref<number | undefined>(undefined)

const query = reactive({
  page: 1,
  size: 10,
  campaignId: '' as string | undefined,
  keyword: '' as string | undefined,
})

const editVisible = ref(false)
const editId = ref<string | null>(null)
const editForm = reactive({
  campaignId: '',
  ruleName: '',
  userSelectType: 'MANUAL_IDS',
  userSelectConfig: '{"ids":[]}',
  startTime: '',
  endTime: '',
  activeHours: '',
  joinProbability: 100,
  intervalMinSeconds: 60,
  intervalMaxSeconds: 300,
  dailyCapPerUser: 10,
  eventTypeConfig: '{"eventType":"JOIN"}',
  status: 1,
  priority: 0,
})

async function fetchData() {
  loading.value = true
  try {
    const res = await listVirtualUserCampaignRules({
      page: query.page,
      size: query.size,
      campaignId: query.campaignId || undefined,
      keyword: query.keyword || undefined,
      status: statusFilter.value,
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
  query.campaignId = ''
  query.keyword = ''
  query.page = 1
  query.size = 10
  statusFilter.value = undefined
  fetchData()
}

function openCreate() {
  editId.value = null
  Object.assign(editForm, {
    campaignId: '',
    ruleName: '',
    userSelectType: 'MANUAL_IDS',
    userSelectConfig: '{"ids":[]}',
    startTime: '',
    endTime: '',
    activeHours: '',
    joinProbability: 100,
    intervalMinSeconds: 60,
    intervalMaxSeconds: 300,
    dailyCapPerUser: 10,
    eventTypeConfig: '{"eventType":"JOIN"}',
    status: 1,
    priority: 0,
  })
  editVisible.value = true
}

function openEdit(row: VirtualUserCampaignRuleVO) {
  editId.value = row.id
  Object.assign(editForm, {
    campaignId: row.campaignId,
    ruleName: row.ruleName,
    userSelectType: row.userSelectType,
    userSelectConfig: row.userSelectConfig,
    startTime: row.startTime,
    endTime: row.endTime,
    activeHours: row.activeHours ?? '',
    joinProbability: row.joinProbability,
    intervalMinSeconds: row.intervalMinSeconds,
    intervalMaxSeconds: row.intervalMaxSeconds,
    dailyCapPerUser: row.dailyCapPerUser,
    eventTypeConfig: row.eventTypeConfig,
    status: row.status,
    priority: row.priority,
  })
  editVisible.value = true
}

async function submitEdit() {
  const body = {
    campaignId: editForm.campaignId.trim(),
    ruleName: editForm.ruleName.trim(),
    userSelectType: editForm.userSelectType,
    userSelectConfig: editForm.userSelectConfig.trim(),
    startTime: editForm.startTime.trim(),
    endTime: editForm.endTime.trim(),
    activeHours: editForm.activeHours.trim() || undefined,
    joinProbability: editForm.joinProbability,
    intervalMinSeconds: editForm.intervalMinSeconds,
    intervalMaxSeconds: editForm.intervalMaxSeconds,
    dailyCapPerUser: editForm.dailyCapPerUser,
    eventTypeConfig: editForm.eventTypeConfig.trim(),
    status: editForm.status,
    priority: editForm.priority,
  }
  if (editId.value) {
    await updateVirtualUserCampaignRule(editId.value, body)
    ElMessage.success('已保存')
  } else {
    await createVirtualUserCampaignRule(body)
    ElMessage.success('已创建')
  }
  editVisible.value = false
  fetchData()
}

async function patchStatus(row: VirtualUserCampaignRuleVO, status: number) {
  await patchVirtualUserCampaignRuleStatus(row.id, { status })
  ElMessage.success(status === 1 ? '已启用' : '已停用')
  fetchData()
}

async function handleDelete(row: VirtualUserCampaignRuleVO) {
  await ElMessageBox.confirm(`删除规则「${row.ruleName}」？`, '确认', { type: 'warning' })
  await deleteVirtualUserCampaignRule(row.id)
  ElMessage.success('已删除')
  fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
}
.mx-2 {
  margin: 0 8px;
}
</style>
