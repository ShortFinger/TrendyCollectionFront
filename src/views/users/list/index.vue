<template>
  <div class="page user-list-page">
    <el-card>
      <template #header>
        <span>用户列表</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="手机/昵称">
          <el-input v-model="keyword" placeholder="手机号或昵称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="balance" label="余额" width="100" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        :page-size="10"
        :total="0"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const keyword = ref('')
const page = ref(1)
</script>

<style scoped>
.user-list-page .filter-form {
  margin-bottom: 16px;
}
</style>
