<template>
  <div class="page growth-tasks-page">
    <el-card>
      <template #header>
        <span>成长任务</span>
        <el-button type="primary" style="float: right">新增任务</el-button>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="任务名称">
          <el-input v-model="keyword" placeholder="任务名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="任务名称" min-width="150" />
        <el-table-column prop="description" label="任务描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="rewardExp" label="奖励经验" width="100" />
        <el-table-column prop="rewardPoints" label="奖励积分" width="100" />
        <el-table-column prop="status" label="状态" width="80" />
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
.growth-tasks-page .filter-form {
  margin-bottom: 16px;
}
</style>
