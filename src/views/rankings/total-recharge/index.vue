<template>
  <div class="page total-recharge-page">
    <el-card>
      <template #header>
        <span>总充值排行榜</span>
      </template>
      <el-table :data="[]" stripe style="width: 100%">
        <el-table-column prop="rank" label="排名" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default>
            <el-avatar :size="32" />
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总充值金额" width="140" />
        <el-table-column prop="lastRechargeTime" label="最近充值时间" width="180" />
      </el-table>
      <el-pagination
        v-model:current-page="page"
        :page-size="20"
        :total="0"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const page = ref(1)
</script>
