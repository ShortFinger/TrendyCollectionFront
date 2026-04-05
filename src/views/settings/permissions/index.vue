<template>
  <div class="page permissions-page">
    <el-card>
      <template #header>
        <span>权限设置</span>
        <el-button type="primary" style="float: right" @click="handleAdd(null)">新增权限</el-button>
      </template>
      <el-table :data="permissionTree" stripe style="width: 100%" row-key="id" default-expand-all :tree-props="{ children: 'children' }" v-loading="loading">
        <el-table-column prop="name" label="权限名称" min-width="180" />
        <el-table-column prop="code" label="权限标识" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'MENU'" type="primary">菜单</el-tag>
            <el-tag v-else-if="row.type === 'PAGE'" type="success">页面</el-tag>
            <el-tag v-else-if="row.type === 'BUTTON'" type="warning">按钮</el-tag>
            <el-tag v-else type="info">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="150" />
        <el-table-column prop="icon" label="图标" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="isEnabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled === 1 ? 'success' : 'danger'" size="small">
              {{ row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleAdd(row.id)">添加子级</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该权限？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="父级权限">
          <el-input :model-value="form.parentId || '无（顶级）'" disabled />
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="form.code" placeholder="例: user:list" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="MENU">菜单</el-radio>
            <el-radio value="PAGE">页面</el-radio>
            <el-radio value="BUTTON">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="路由路径">
          <el-input v-model="form.path" placeholder="前端路由路径" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="菜单图标" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态">
          <el-radio-group v-model="form.isEnabled">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getPermissionTree, createPermission, updatePermission, deletePermission } from '@/api/permission'
import type { PermissionVO } from '@/types/auth'
import { PermissionTypeCode } from '@/constants/domainCodes'

const loading = ref(false)
const permissionTree = ref<PermissionVO[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: '',
  parentId: '' as string | null,
  name: '',
  code: '',
  type: PermissionTypeCode.MENU as string,
  path: '',
  icon: '',
  sortOrder: 0,
  isEnabled: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await getPermissionTree()
    permissionTree.value = data
  } finally {
    loading.value = false
  }
}

function handleAdd(parentId: string | null) {
  isEdit.value = false
  form.id = ''
  form.parentId = parentId
  form.name = ''
  form.code = ''
  form.type = PermissionTypeCode.MENU
  form.path = ''
  form.icon = ''
  form.sortOrder = 0
  form.isEnabled = 1
  dialogVisible.value = true
}

function handleEdit(row: PermissionVO) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    code: row.code,
    type: row.type,
    path: row.path || '',
    icon: row.icon || '',
    sortOrder: row.sortOrder || 0,
    isEnabled: row.isEnabled,
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updatePermission({ ...form, parentId: form.parentId ?? undefined })
    } else {
      const { id: _id, isEnabled: _e, ...createData } = form
      await createPermission({ ...createData, parentId: createData.parentId ?? undefined })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id: string) {
  await deletePermission(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>
