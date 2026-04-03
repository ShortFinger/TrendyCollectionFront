<template>
  <div class="app-page-create">
    <el-card shadow="never">
      <template #header>
        <span>新增页面</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 480px">
        <el-form-item label="pageKey" prop="pageKey">
          <el-input v-model="form.pageKey" placeholder="小写字母、数字、-、_，1–64 字符" clearable />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="页面标题" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">创建并进入编辑</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createAppPage } from '@/api/appCms'
import { useAppPageList } from '@/composables/useAppPageList'

const router = useRouter()
const { fetchAppPages } = useAppPageList()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const PAGE_KEY_PATTERN = /^[a-z0-9_-]{1,64}$/

const form = reactive({
  pageKey: '',
  title: '',
})

const rules: FormRules = {
  pageKey: [
    { required: true, message: '请输入 pageKey', trigger: 'blur' },
    {
      pattern: PAGE_KEY_PATTERN,
      message: '仅允许小写字母、数字、连字符、下划线，长度 1–64',
      trigger: 'blur',
    },
  ],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const key = form.pageKey.trim()
  submitting.value = true
  try {
    await createAppPage({ pageKey: key, title: form.title.trim() })
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
</style>
