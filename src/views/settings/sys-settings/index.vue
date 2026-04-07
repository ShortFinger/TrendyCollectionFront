<template>
  <div class="page sys-settings-page">
    <el-card>
      <template #header>
        <span>设置项</span>
      </template>
      <el-table :data="rows" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="72" />
        <el-table-column prop="settingType" label="配置类型" min-width="160" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑设置项" width="640px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置类型">
          <el-input :model-value="form.settingType" disabled />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注" />
        </el-form-item>
        <el-form-item label="JSON 配置">
          <el-input
            v-model="form.settingConfig"
            type="textarea"
            :rows="16"
            class="sys-settings-json"
            placeholder="合法的 JSON 文本"
          />
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
import { listSysSettings, updateSysSetting } from '@/api/sysSetting'
import type { SysSettingVO } from '@/types/sysSetting'

const loading = ref(false)
const rows = ref<SysSettingVO[]>([])
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  settingType: '',
  remark: '' as string | null | undefined,
  settingConfig: '',
})

async function loadList() {
  loading.value = true
  try {
    const res = await listSysSettings()
    rows.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

function openEdit(row: SysSettingVO) {
  editingId.value = row.id
  form.settingType = row.settingType
  form.remark = row.remark ?? ''
  form.settingConfig = row.settingConfig
  dialogVisible.value = true
}

async function handleSubmit() {
  if (editingId.value == null) return
  try {
    JSON.parse(form.settingConfig)
  } catch {
    ElMessage.warning('JSON 格式不正确')
    return
  }
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
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.sys-settings-json :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
}
</style>
