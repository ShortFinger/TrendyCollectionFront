<template>
  <div class="page growth-details-page">
    <el-card>
      <template #header>
        <span>成长明细</span>
      </template>
      <el-form :inline="true" class="filter-form">
        <el-form-item label="用户">
          <el-input v-model="keyword" placeholder="昵称/手机号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="type" placeholder="全部" clearable style="width: 120px">
            <el-option label="经验" value="exp" />
            <el-option label="积分" value="points" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="用户" min-width="120" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="changeValue" label="变动值" width="100" />
        <el-table-column prop="reason" label="变动原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="180" />
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
.growth-details-page .filter-form {
  margin-bottom: 16px;
}
</style>
