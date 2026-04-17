<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">新建草稿</el-button>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="rows" border stripe style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="类型" width="200">
        <template #default="{ row }">
          <span>{{ docTypeLabel(row.docType) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <span>{{ row.status === 1 ? '已发布' : '草稿' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="effectiveTime" label="生效时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 0 || row.status === 1"
            link
            type="primary"
            size="small"
            @click="openEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="row.status === 0"
            link
            type="success"
            size="small"
            @click="onPublish(row)"
          >
            发布
          </el-button>
          <el-button
            v-if="row.status === 0"
            link
            type="danger"
            size="small"
            @click="onDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="createVisible" title="新建草稿" width="640px" destroy-on-close @closed="resetCreate">
      <el-form label-width="88px">
        <el-form-item label="类型" required>
          <el-select v-model="createForm.docType" placeholder="选择协议类型" style="width: 100%">
            <el-option label="用户协议 USER_TERMS" value="USER_TERMS" />
            <el-option label="隐私政策 PRIVACY_POLICY" value="PRIVACY_POLICY" />
            <el-option label="个人信息收集清单 PERSONAL_INFO_COLLECTION" value="PERSONAL_INFO_COLLECTION" />
            <el-option label="未成年人隐私协议 MINORS_PRIVACY_POLICY" value="MINORS_PRIVACY_POLICY" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="createForm.title" />
        </el-form-item>
        <el-form-item label="正文" required>
          <el-input v-model="createForm.body" type="textarea" :rows="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitCreate">保存草稿</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editVisible"
      :title="editForm.status === 1 ? '编辑已发布协议' : '编辑草稿'"
      width="640px"
      destroy-on-close
    >
      <el-alert
        v-if="editForm.status === 1"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
        description="保存后将直接更新用户端展示的标题与正文，版本号不变；不会要求已同意用户重新勾选。"
      />
      <el-form label-width="88px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="正文" required>
          <el-input v-model="editForm.body" type="textarea" :rows="12" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createLegalDraft,
  deleteLegalDraft,
  listLegalDocuments,
  publishLegalDocument,
  updateLegalDocument,
  type LegalDocumentRow,
} from '@/api/legalAdmin'

const DOC_TYPE_LABELS: Record<string, string> = {
  USER_TERMS: '用户协议',
  PRIVACY_POLICY: '隐私政策',
  PERSONAL_INFO_COLLECTION: '个人信息收集清单',
  MINORS_PRIVACY_POLICY: '未成年人隐私协议',
}

function docTypeLabel(code: string) {
  return DOC_TYPE_LABELS[code] ?? code
}

const loading = ref(false)
const saving = ref(false)
const rows = ref<LegalDocumentRow[]>([])

const createVisible = ref(false)
const createForm = reactive({
  docType: 'USER_TERMS',
  title: '',
  body: '',
})

const editVisible = ref(false)
const editForm = reactive({
  id: '',
  status: 0 as number,
  title: '',
  body: '',
})

async function load() {
  loading.value = true
  try {
    const res = await listLegalDocuments()
    rows.value = res.data || []
  } catch {
    /* 错误提示由 request 拦截器统一处理 */
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetCreate()
  createVisible.value = true
}

function resetCreate() {
  createForm.docType = 'USER_TERMS'
  createForm.title = ''
  createForm.body = ''
}

async function submitCreate() {
  if (!createForm.docType || !createForm.title.trim() || !createForm.body.trim()) {
    ElMessage.warning('请填写类型、标题与正文')
    return
  }
  saving.value = true
  try {
    await createLegalDraft({
      docType: createForm.docType,
      title: createForm.title.trim(),
      body: createForm.body.trim(),
    })
    ElMessage.success('已创建草稿')
    createVisible.value = false
    await load()
  } catch {
    /* 失败由拦截器提示 */
  } finally {
    saving.value = false
  }
}

function openEdit(row: LegalDocumentRow) {
  editForm.id = row.id
  editForm.status = row.status
  editForm.title = row.title
  editForm.body = row.body
  editVisible.value = true
}

async function submitEdit() {
  if (!editForm.title.trim() || !editForm.body.trim()) {
    ElMessage.warning('请填写标题与正文')
    return
  }
  saving.value = true
  try {
    await updateLegalDocument(editForm.id, {
      title: editForm.title.trim(),
      body: editForm.body.trim(),
    })
    ElMessage.success('已保存')
    editVisible.value = false
    await load()
  } catch {
    /* 失败由拦截器提示 */
  } finally {
    saving.value = false
  }
}

async function onPublish(row: LegalDocumentRow) {
  try {
    await ElMessageBox.confirm(`确定发布「${row.title}」v${row.version}？发布后将作为该类型当前生效版本。`, '发布', {
      type: 'warning',
    })
  } catch {
    return
  }
  saving.value = true
  try {
    await publishLegalDocument(row.id)
    ElMessage.success('已发布')
    await load()
  } catch {
    /* 失败由拦截器提示 */
  } finally {
    saving.value = false
  }
}

async function onDelete(row: LegalDocumentRow) {
  if (row.status !== 0) {
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除草稿「${row.title}」v${row.version}？此操作不可恢复。`, '删除草稿', {
      type: 'warning',
    })
  } catch {
    return
  }
  saving.value = true
  try {
    await deleteLegalDraft(row.id)
    ElMessage.success('已删除')
    await load()
  } catch {
    /* 失败由拦截器提示 */
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.page-wrap {
  padding: 16px;
}
.toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
