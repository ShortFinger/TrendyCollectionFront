<template>
  <div class="page warehouse-page">
    <el-card>
      <template #header>
        <span>盒柜仓库</span>
        <el-button type="primary" style="float: right">新增入库</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="商品名称">
          <el-input v-model="keyword" placeholder="商品名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="type" placeholder="全部" clearable style="width: 120px">
            <el-option label="盒" value="box" />
            <el-option label="柜" value="cabinet" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="totalStock" label="库存数量" width="100" />
        <el-table-column prop="allocated" label="已分配" width="100" />
        <el-table-column prop="available" label="可用库存" width="100" />
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
const type = ref('')
const page = ref(1)
</script>

<style scoped>
.warehouse-page .filter-form {
  margin-bottom: 16px;
}
</style>
