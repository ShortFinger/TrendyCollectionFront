<template>
  <div class="page zones-page">
    <el-card>
      <template #header>
        <span>分区管理</span>
        <el-button type="primary" style="float: right">新增分区</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="分区名称">
          <el-input v-model="keyword" placeholder="分区名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分区名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="goodsCount" label="商品数量" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
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
const page = ref(1)
</script>

<style scoped>
.zones-page .filter-form {
  margin-bottom: 16px;
}
</style>
