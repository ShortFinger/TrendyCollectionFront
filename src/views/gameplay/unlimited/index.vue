<template>
  <div class="page unlimited-page">
    <el-card>
      <template #header>
        <span>无限赏</span>
        <el-button type="primary" style="float: right">新增赏品</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="赏品名称">
          <el-input v-model="keyword" placeholder="赏品名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="status" placeholder="全部" clearable style="width: 120px">
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="未开始" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="赏品名称" min-width="160" />
        <el-table-column prop="level" label="等级" width="100" />
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="probability" label="概率" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
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
const status = ref('')
const page = ref(1)
</script>

<style scoped>
.unlimited-page .filter-form {
  margin-bottom: 16px;
}
</style>
