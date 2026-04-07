<template>
  <div class="page sys-settings-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设置项</span>
          <el-button type="primary" @click="openCreate">新增</el-button>
        </div>
      </template>
      <el-table :data="rows" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="settingType" label="配置类型" min-width="160" show-overflow-tooltip />
        <el-table-column label="配置摘要" min-width="220">
          <template #default="{ row }">
            <template v-for="s in [summaryParts(row.settingConfig)]" :key="row.id">
              <span v-if="s.invalid" class="summary-cell">（无效 JSON）</span>
              <el-tooltip v-else placement="top" :content="s.tooltip">
                <span class="summary-cell">{{ s.short }}</span>
              </el-tooltip>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑设置项' : '新建设置项'"
      width="640px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置类型">
          <el-input v-if="!isEdit" v-model="form.settingType" placeholder="配置类型" />
          <el-input v-else :model-value="form.settingType" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注" />
        </el-form-item>
        <el-form-item label="JSON 配置">
          <div class="json-config-field">
            <el-button class="format-btn" size="small" @click="formatJson">格式化</el-button>
            <el-input
              v-model="form.settingConfig"
              type="textarea"
              :rows="16"
              class="sys-settings-json"
              placeholder="合法的 JSON 文本"
            />
          </div>
        </el-form-item>
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
import { listSysSettings, updateSysSetting, createSysSetting } from '@/api/sysSetting'
import type { SysSettingVO } from '@/types/sysSetting'

const SUMMARY_LEN = 120
const TOOLTIP_MAX = 2048

const loading = ref(false)
const rows = ref<SysSettingVO[]>([])
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)
const isEdit = ref(false)

const form = reactive({
  settingType: '',
  remark: '' as string | null | undefined,
  settingConfig: '',
})

function summaryParts(raw: string): { short: string; tooltip: string; invalid: boolean } {
  try {
    const parsed = JSON.parse(raw)
    const full = JSON.stringify(parsed, null, 2)
    const short = full.length > SUMMARY_LEN ? `${full.slice(0, SUMMARY_LEN)}…` : full
    const tooltip = full.length > TOOLTIP_MAX ? `${full.slice(0, TOOLTIP_MAX)}…` : full
    return { short, tooltip, invalid: false }
  } catch {
    return { short: '（无效 JSON）', tooltip: '（无效 JSON）', invalid: true }
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await listSysSettings()
    rows.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.settingType = ''
  form.remark = ''
  form.settingConfig = JSON.stringify(JSON.parse('{}'), null, 2)
  dialogVisible.value = true
}

function openEdit(row: SysSettingVO) {
  isEdit.value = true
  editingId.value = row.id
  form.settingType = row.settingType
  form.remark = row.remark ?? ''
  form.settingConfig = row.settingConfig
  dialogVisible.value = true
}

function formatJson() {
  try {
    const parsed = JSON.parse(form.settingConfig)
    form.settingConfig = JSON.stringify(parsed, null, 2)
  } catch {
    ElMessage.warning('JSON 格式不正确')
  }
}

async function handleSubmit() {
  try {
    JSON.parse(form.settingConfig)
  } catch {
    ElMessage.warning('JSON 格式不正确')
    return
  }

  if (isEdit.value && editingId.value != null) {
    submitLoading.value = true
    try {
      await updateSysSetting(editingId.value, {
        settingConfig: form.settingConfig,
        remark: form.remark === '' ? null : form.remark,
      })
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await loadList()
    } finally {
      submitLoading.value = false
    }
    return
  }

  if (!form.settingType.trim()) {
    ElMessage.warning('请输入配置类型')
    return
  }

  submitLoading.value = true
  try {
    await createSysSetting({
      settingType: form.settingType.trim(),
      settingConfig: form.settingConfig,
      remark: form.remark === '' ? null : form.remark,
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    await loadList()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.json-config-field {
  width: 100%;
}

.format-btn {
  margin-bottom: 8px;
}

.summary-cell {
  white-space: pre-wrap;
  word-break: break-all;
}

.sys-settings-json :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
}
</style>
