<template>
  <div class="page user-addresses-page">
    <el-card>
      <template #header>
        <span>用户收货地址</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="用户 ID">
          <el-input v-model="query.userId" placeholder="精确" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="收件人手机">
          <el-input v-model="query.consigneePhone" placeholder="模糊" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="区县代码">
          <el-input v-model="query.districtCode" placeholder="6 位" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="省（关键词）">
          <el-input v-model="query.provinceKeyword" placeholder="模糊" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="创建起">
          <el-date-picker
            v-model="query.createTimeStart"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="开始时间"
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item label="创建止">
          <el-date-picker
            v-model="query.createTimeEnd"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="结束时间"
            style="width: 190px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" :loading="exporting" @click="handleExport">导出 CSV</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="userId" label="用户 ID" min-width="160" show-overflow-tooltip />
        <el-table-column prop="consigneeName" label="收件人" width="100" />
        <el-table-column prop="consigneePhoneMasked" label="手机（脱敏）" width="130" />
        <el-table-column label="省市区" min-width="200">
          <template #default="{ row }">
            {{ row.provinceName }} {{ row.cityName }} {{ row.districtName }}
          </template>
        </el-table-column>
        <el-table-column prop="districtCode" label="区县码" width="100" />
        <el-table-column prop="detailAddress" label="详细地址" min-width="180" show-overflow-tooltip />
        <el-table-column label="默认" width="72">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault === 1" type="success" size="small">是</el-tag>
            <span v-else style="color: #909399">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listUserAddresses, exportUserAddresses } from '@/api/userAddress'
import type { UserAddressAdminVO } from '@/types/userAddress'

const loading = ref(false)
const exporting = ref(false)
const list = ref<UserAddressAdminVO[]>([])
const total = ref(0)
const query = reactive({
  page: 1,
  size: 10,
  userId: '',
  consigneePhone: '',
  districtCode: '',
  provinceKeyword: '',
  createTimeStart: undefined as string | undefined,
  createTimeEnd: undefined as string | undefined,
})

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: query.page,
      size: query.size,
    }
    if (query.userId) params.userId = query.userId
    if (query.consigneePhone) params.consigneePhone = query.consigneePhone
    if (query.districtCode) params.districtCode = query.districtCode
    if (query.provinceKeyword) params.provinceKeyword = query.provinceKeyword
    if (query.createTimeStart) params.createTimeStart = query.createTimeStart
    if (query.createTimeEnd) params.createTimeEnd = query.createTimeEnd
    const { data } = await listUserAddresses(params as any)
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchData()
}

function handleReset() {
  query.userId = ''
  query.consigneePhone = ''
  query.districtCode = ''
  query.provinceKeyword = ''
  query.createTimeStart = undefined
  query.createTimeEnd = undefined
  query.page = 1
  fetchData()
}

async function handleExport() {
  exporting.value = true
  try {
    const params: Record<string, unknown> = {}
    if (query.userId) params.userId = query.userId
    if (query.consigneePhone) params.consigneePhone = query.consigneePhone
    if (query.districtCode) params.districtCode = query.districtCode
    if (query.provinceKeyword) params.provinceKeyword = query.provinceKeyword
    if (query.createTimeStart) params.createTimeStart = query.createTimeStart
    if (query.createTimeEnd) params.createTimeEnd = query.createTimeEnd
    const blob = (await exportUserAddresses(params as any)) as unknown as Blob
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user-addresses.csv'
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已开始下载')
  } catch {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.user-addresses-page .filter-form {
  margin-bottom: 16px;
}
</style>
