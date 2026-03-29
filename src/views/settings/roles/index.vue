<template>
  <div class="page roles-page">
    <el-card>
      <template #header>
        <span>角色设置</span>
        <el-button type="primary" style="float: right" @click="handleAdd">新增角色</el-button>
      </template>
      <el-table :data="roles" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isEnabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled === 1 ? 'success' : 'danger'" size="small">
              {{ row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handlePermission(row)">权限</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该角色？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="例: operation" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="角色描述" />
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

    <el-dialog v-model="permDialogVisible" title="分配权限" width="500px" :close-on-click-modal="false">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="permLoading" @click="handlePermSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { listRoles, createRole, updateRole, deleteRole } from '@/api/role'
import { getPermissionTree } from '@/api/permission'
import type { RoleVO } from '@/types/role'
import type { PermissionVO } from '@/types/auth'

const loading = ref(false)
const roles = ref<RoleVO[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const permDialogVisible = ref(false)
const permLoading = ref(false)
const permissionTree = ref<PermissionVO[]>([])
const treeRef = ref<any>()
const currentRoleId = ref('')

const form = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  isEnabled: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await listRoles()
    roles.value = data
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.code = ''
  form.description = ''
  form.isEnabled = 1
  dialogVisible.value = true
}

function handleEdit(row: RoleVO) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
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
      await updateRole({ id: form.id, name: form.name, description: form.description, isEnabled: form.isEnabled })
    } else {
      await createRole({ name: form.name, code: form.code, description: form.description })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handlePermission(row: RoleVO) {
  currentRoleId.value = row.id
  const { data } = await getPermissionTree()
  permissionTree.value = data
  permDialogVisible.value = true
  await nextTick()
  treeRef.value?.setCheckedKeys(row.permissionIds || [])
}

async function handlePermSubmit() {
  permLoading.value = true
  try {
    const checkedKeys = treeRef.value?.getCheckedKeys(false) || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
    await updateRole({ id: currentRoleId.value, permissionIds: [...checkedKeys, ...halfCheckedKeys] })
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
    fetchData()
  } finally {
    permLoading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteRole(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(fetchData)
</script>
