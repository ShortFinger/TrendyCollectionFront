<template>
  <div class="page categories-page">
    <el-card>
      <template #header>
        <span>分类管理</span>
        <el-button type="primary" style="float: right" @click="handleAdd">新增分类</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="标题">
          <el-input v-model="keyword" placeholder="关键词" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" min-width="120" />
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column label="方图" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.squareThumb"
              :src="row.squareThumb"
              :preview-src-list="[row.squareThumb]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ENABLED' ? 'success' : 'info'" size="small">
              {{ categoryStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @change="fetchData"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="标题" />
        </el-form-item>
        <el-divider content-position="left">素材 URL</el-divider>
        <el-form-item label="正方形封面" prop="squareThumb">
          <el-input v-model="form.squareThumb" placeholder="URL" />
        </el-form-item>
        <el-form-item label="长方形封面" prop="longThumb">
          <el-input v-model="form.longThumb" placeholder="URL" />
        </el-form-item>
        <el-form-item label="左上标" prop="upperLeftCornerMark">
          <el-input v-model="form.upperLeftCornerMark" placeholder="URL" />
        </el-form-item>
        <el-form-item label="右上标" prop="upperRightCornerMark">
          <el-input v-model="form.upperRightCornerMark" placeholder="URL" />
        </el-form-item>
        <el-form-item label="左下标" prop="lowerLeftCornerMark">
          <el-input v-model="form.lowerLeftCornerMark" placeholder="URL" />
        </el-form-item>
        <el-form-item label="右下标" prop="lowerRightCornerMark">
          <el-input v-model="form.lowerRightCornerMark" placeholder="URL" />
        </el-form-item>
        <el-form-item label="轮播图" prop="images">
          <el-input v-model="form.images" placeholder="URL 或留空" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 200px">
            <el-option label="启用" value="ENABLED" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listCategories, createCategory, updateCategory, deleteCategory } from '@/api/category'
import type { CategoryVO, CategorySaveRequest } from '@/types/category'
import { CategoryEnableStatus, categoryStatusText } from '@/constants/domainCodes'

const loading = ref(false)
const list = ref<CategoryVO[]>([])
const total = ref(0)
const keyword = ref('')
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const defaultForm = (): CategorySaveRequest => ({
  title: '',
  squareThumb: '',
  longThumb: '',
  upperLeftCornerMark: '',
  upperRightCornerMark: '',
  lowerLeftCornerMark: '',
  lowerRightCornerMark: '',
  images: '',
  status: CategoryEnableStatus.ENABLED,
})

const form = reactive<CategorySaveRequest>(defaultForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await listCategories({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
    })
    list.value = data.records
    total.value = data.total
  } catch {
    ElMessage.error('分类数据加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchData()
}

function handleReset() {
  keyword.value = ''
  page.value = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function handleEdit(row: CategoryVO) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    title: row.title,
    squareThumb: row.squareThumb || '',
    longThumb: row.longThumb || '',
    upperLeftCornerMark: row.upperLeftCornerMark || '',
    upperRightCornerMark: row.upperRightCornerMark || '',
    lowerLeftCornerMark: row.lowerLeftCornerMark || '',
    lowerRightCornerMark: row.lowerRightCornerMark || '',
    images: row.images || '',
    status: row.status,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const payload: CategorySaveRequest = {
      ...form,
      images: form.images ?? '',
    }
    if (isEdit.value) {
      await updateCategory(editId.value, payload)
      ElMessage.success('编辑成功')
    } else {
      await createCategory(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: CategoryVO) {
  await ElMessageBox.confirm(`确定删除分类「${row.title}」？`, '提示', { type: 'warning' })
  try {
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.categories-page .filter-form {
  margin-bottom: 16px;
}
</style>
