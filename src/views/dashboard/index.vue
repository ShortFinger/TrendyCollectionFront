<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon sales">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ orderCount }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon amount">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ salesAmount }}</div>
              <div class="stat-label">今日销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon goods">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ goodsCount }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>快捷入口</span>
          </template>
          <div class="shortcuts">
            <router-link to="/goods" class="shortcut-item">
              <el-icon :size="28"><Goods /></el-icon>
              <span>商品管理</span>
            </router-link>
            <router-link to="/orders" class="shortcut-item">
              <el-icon :size="28"><List /></el-icon>
              <span>订单管理</span>
            </router-link>
            <router-link to="/users" class="shortcut-item">
              <el-icon :size="28"><User /></el-icon>
              <span>用户管理</span>
            </router-link>
            <router-link to="/settings" class="shortcut-item">
              <el-icon :size="28"><Setting /></el-icon>
              <span>系统设置</span>
            </router-link>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="当前用户">{{ authStore.admin?.realName || authStore.admin?.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ authStore.admin?.roleName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ authStore.admin?.lastLoginTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="登录IP">{{ authStore.admin?.lastLoginIp || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Goods, Money, User, Box, List, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const orderCount = ref(0)
const salesAmount = ref('0')
const userCount = ref(0)
const goodsCount = ref(0)
</script>

<style scoped>
.dashboard { width: 100%; }
.stats-row { margin-bottom: 0; }
.stat-card { border-radius: 8px; }
.stat-content { display: flex; align-items: center; gap: 16px; }
.stat-icon {
  width: 56px; height: 56px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.stat-icon.sales { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.amount { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.users { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.goods { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-value { font-size: 22px; font-weight: 600; color: #303133; }
.stat-label { font-size: 14px; color: #909399; margin-top: 4px; }
.shortcuts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.shortcut-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px; border-radius: 8px; color: #606266; text-decoration: none; transition: all 0.2s;
}
.shortcut-item:hover { background: #ecf5ff; color: #409eff; }
</style>
