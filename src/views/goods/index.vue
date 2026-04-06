<template>
  <div class="page goods-page">
    <el-card>
      <template #header>
        <span>商品管理</span>
        <el-button type="primary" style="float: right" @click="handleAdd">新增商品</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="商品名称/编号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterStatus" clearable placeholder="全部状态" style="width: 160px">
            <el-option label="上架" value="ON_SHELF" />
            <el-option label="下架" value="OFF_SHELF" />
            <el-option label="待上架" value="PENDING_LISTING" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" min-width="120" />
        <el-table-column prop="productCode" label="商品编码" min-width="140" />
        <el-table-column prop="name" label="商品名称" min-width="220" />
        <el-table-column label="主图" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.mainImageUrl"
              :src="row.mainImageUrl"
              :preview-src-list="[row.mainImageUrl]"
              fit="cover"
              style="width: 40px; height: 40px; border-radius: 4px"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="productListingTagType(row.status)" size="small">{{ productListingStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
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
      :title="isEdit ? '编辑商品' : '新增商品'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入商品编码" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
        </el-form-item>
        <el-divider content-position="left">图片信息</el-divider>
        <el-form-item label="主图" prop="mainImageUrl">
          <MediaUpload v-model="form.mainImageUrl" :dir="uploadDir('main')" />
        </el-form-item>
        <el-form-item label="展示图" prop="showImage">
          <MediaUpload v-model="form.showImage" :dir="uploadDir('show')" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="顶视图" prop="topImage">
              <MediaUpload v-model="form.topImage" :dir="uploadDir('top')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="底视图" prop="bottomImage">
              <MediaUpload v-model="form.bottomImage" :dir="uploadDir('bottom')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="前视图" prop="frontImage">
              <MediaUpload v-model="form.frontImage" :dir="uploadDir('front')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="后视图" prop="backImage">
              <MediaUpload v-model="form.backImage" :dir="uploadDir('back')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="左视图" prop="leftImage">
              <MediaUpload v-model="form.leftImage" :dir="uploadDir('left')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="右视图" prop="rightImage">
              <MediaUpload v-model="form.rightImage" :dir="uploadDir('right')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">其他</el-divider>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 200px">
            <el-option label="上架" value="ON_SHELF" />
            <el-option label="下架" value="OFF_SHELF" />
            <el-option label="待上架" value="PENDING_LISTING" />
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
import { listProducts, createProduct, updateProduct, deleteProduct } from '@/api/product'
import type { ProductVO, ProductSaveRequest } from '@/types/product'
import { ProductListingStatus, productListingStatusText, productListingTagType } from '@/constants/domainCodes'
import MediaUpload from '@/components/MediaUpload.vue'
import { moveFiles } from '@/api/oss'

const loading = ref(false)
const list = ref<ProductVO[]>([])
const total = ref(0)
const keyword = ref('')
const filterStatus = ref<string | undefined>(undefined)
const page = ref(1)
const size = ref(10)

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const tempId = ref('')

const defaultForm = (): ProductSaveRequest => ({
  productCode: '',
  name: '',
  description: '',
  mainImageUrl: '',
  showImage: '',
  topImage: '',
  frontImage: '',
  backImage: '',
  bottomImage: '',
  leftImage: '',
  rightImage: '',
  status: ProductListingStatus.ON_SHELF,
})

const form = reactive<ProductSaveRequest>(defaultForm())

function uploadDir(field: string) {
  if (isEdit.value) {
    return `products/${editId.value}/${field}`
  }
  return `temp/${tempId.value}/${field}`
}

const rules: FormRules = {
  productCode: [{ required: true, message: '请输入商品编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await listProducts({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      status: filterStatus.value,
    })
    list.value = data.records
    total.value = data.total
  } catch {
    ElMessage.error('商品数据加载失败')
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
  filterStatus.value = undefined
  page.value = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  Object.assign(form, defaultForm())
  tempId.value = crypto.randomUUID()
  dialogVisible.value = true
}

function handleEdit(row: ProductVO) {
  isEdit.value = true
  tempId.value = ''
  editId.value = row.id
  Object.assign(form, {
    productCode: row.productCode,
    name: row.name,
    description: row.description || '',
    mainImageUrl: row.mainImageUrl || '',
    showImage: row.showImage || '',
    topImage: row.topImage || '',
    frontImage: row.frontImage || '',
    backImage: row.backImage || '',
    bottomImage: row.bottomImage || '',
    leftImage: row.leftImage || '',
    rightImage: row.rightImage || '',
    status: row.status,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateProduct(editId.value, form)
      ElMessage.success('编辑成功')
    } else {
      const { data } = await createProduct(form)
      const productId = typeof data === 'object' && data !== null && 'id' in data ? (data as any).id : data
      // 新建成功后移动临时文件到正式目录
      const fieldMapping: Record<string, string> = {
        main: 'mainImageUrl',
        show: 'showImage',
        top: 'topImage',
        bottom: 'bottomImage',
        front: 'frontImage',
        back: 'backImage',
        left: 'leftImage',
        right: 'rightImage',
      }
      const usedFields = Object.entries(fieldMapping)
        .filter(([, formKey]) => !!(form as any)[formKey])
        .map(([field]) => field)
      if (usedFields.length > 0) {
        const moveRes = await moveFiles({
          tempId: tempId.value,
          targetDir: `products/${productId}`,
          fields: usedFields,
        })
        // 用新路径更新实体
        const updates: Record<string, string> = {}
        for (const [field, newKey] of Object.entries(moveRes.data.movedKeys)) {
          updates[fieldMapping[field]] = newKey
        }
        if (Object.keys(updates).length > 0) {
          await updateProduct(productId, { ...form, ...updates })
        }
      }
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

async function handleDelete(row: ProductVO) {
  await ElMessageBox.confirm(`确定删除商品「${row.name}」？`, '提示', { type: 'warning' })
  try {
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.goods-page .filter-form {
  margin-bottom: 16px;
}
</style>
