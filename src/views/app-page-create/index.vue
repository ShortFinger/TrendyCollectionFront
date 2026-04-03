<template>
  <div class="app-page-create">
    <el-card shadow="never">
      <template #header>
        <span>新增页面</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 480px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="页面标题" clearable />
        </el-form-item>
        <el-form-item label="页面路径" prop="appPageUrl">
          <el-input
            v-model="form.appPageUrl"
            placeholder="如 pages/foo/bar 或 /pages/foo/bar"
            clearable
          />
        </el-form-item>
        <el-form-item label="pageKey" prop="pageKey">
          <div class="page-key-row">
            <el-input
              v-model="form.pageKey"
              placeholder="小写字母、数字、-、_，1–64 字符"
              clearable
              @input="onPageKeyInput"
            />
            <el-button type="default" @click="syncPageKeyFromUrl">与路径同步</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">创建并进入编辑</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createAppPage } from '@/api/appCms'
import { useAppPageList } from '@/composables/useAppPageList'
import {
  derivePageKeyFromNormalizedPath,
  normalizeAppPageUrl,
} from '@/utils/appPagePath'

const router = useRouter()
const { fetchAppPages } = useAppPageList()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const PAGE_KEY_PATTERN = /^[a-z0-9_-]{1,64}$/

const form = reactive({
  title: '',
  appPageUrl: '',
  pageKey: '',
})

const userEditedPageKey = ref(false)
const syncingFromUrl = ref(false)

function applyPageKeyFromUrl() {
  const n = normalizeAppPageUrl(form.appPageUrl)
  const d = n ? derivePageKeyFromNormalizedPath(n) : null
  syncingFromUrl.value = true
  form.pageKey = d ?? ''
  nextTick(() => {
    syncingFromUrl.value = false
  })
}

watch(
  () => form.appPageUrl,
  () => {
    if (userEditedPageKey.value) return
    applyPageKeyFromUrl()
  },
)

function onPageKeyInput() {
  if (!syncingFromUrl.value) userEditedPageKey.value = true
}

function syncPageKeyFromUrl() {
  userEditedPageKey.value = false
  applyPageKeyFromUrl()
}

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  appPageUrl: [
    { required: true, message: '请输入页面路径', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (normalizeAppPageUrl(value || '') === null) {
          callback(new Error('须为以 pages/ 开头的有效路径，且不能有 .. 或空段'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  pageKey: [
    { required: true, message: '请输入 pageKey', trigger: 'blur' },
    {
      pattern: PAGE_KEY_PATTERN,
      message: '仅允许小写字母、数字、连字符、下划线，长度 1–64',
      trigger: 'blur',
    },
  ],
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const normalize = normalizeAppPageUrl(form.appPageUrl)
  if (normalize === null) {
    ElMessage.error('页面路径无效，请检查')
    return
  }
  const key = form.pageKey.trim()
  submitting.value = true
  try {
    await createAppPage({
      pageKey: key,
      title: form.title.trim(),
      appPageUrl: normalize,
    })
    ElMessage.success('已创建')
    await fetchAppPages()
    router.push('/app-mgmt/page/' + key)
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.app-page-create {
  max-width: 720px;
}

.page-key-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.page-key-row .el-input {
  flex: 1;
}
</style>
