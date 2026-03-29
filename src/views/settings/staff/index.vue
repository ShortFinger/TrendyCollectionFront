<template>
  <div class="page staff-page">
    <el-card>
      <template #header>
        <span>人员设置</span>
        <el-button type="primary" style="float: right" @click="handleAdd">新增人员</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="query.realName" placeholder="姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roleName" label="角色" width="120" />
        <el-table-column prop="isEnabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled === 1 ? 'success' : 'danger'" size="small">
              {{ row.isEnabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该管理员？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑人员' : '新增人员'" width="500px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="登录用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="登录密码" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
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
import { listAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/api/admin'
import { listRoles } from '@/api/role'
import type { AdminVO } from '@/types/auth'
import type { RoleVO } from '@/types/role'

const loading = ref(false)
const list = ref<AdminVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 10, realName: '' })
const roleOptions = ref<RoleVO[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  id: '',
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  roleId: '',
  isEnabled: 1,
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await listAdmins(query)
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  const { data } = await listRoles()
  roleOptions.value = data
}

function handleSearch() {
  query.page = 1
  fetchData()
}

function handleReset() {
  query.realName = ''
  query.page = 1
  fetchData()
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, { id: '', username: '', password: '', realName: '', phone: '', email: '', roleId: '', isEnabled: 1 })
  dialogVisible.value = true
}

function handleEdit(row: AdminVO) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    realName: row.realName || '',
    phone: row.phone || '',
    email: row.email || '',
    roleId: row.roleId || '',
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
      await updateAdmin({
        id: form.id,
        realName: form.realName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        roleId: form.roleId || undefined,
        isEnabled: form.isEnabled,
      })
    } else {
      await createAdmin({
        username: form.username,
        password: form.password,
        realName: form.realName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        roleId: form.roleId,
      })
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteAdmin(id)
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchRoles()
})
</script>

<style scoped>
.staff-page .filter-form {
  margin-bottom: 16px;
}
</style>
