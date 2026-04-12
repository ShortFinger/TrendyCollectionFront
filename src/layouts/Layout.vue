<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="layout-aside">
      <div class="logo">
        <span>TrendyCollection</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :default-openeds="openedMenus"
        class="layout-menu"
        background-color="#1a1d24"
        text-color="#a3a6ad"
        active-text-color="#409eff"
        router
      >
        <template v-for="item in menuRoutes" :key="item.path">
          <el-sub-menu v-if="item.path === 'app-mgmt'" :index="'/' + item.path">
            <template #title>
              <el-icon><component :is="item.meta?.icon" /></el-icon>
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item index="/app-mgmt/page-create"><span>新增页面</span></el-menu-item>
            <el-menu-item index="/app-mgmt/global"><span>通用配置</span></el-menu-item>
            <el-menu-item v-for="p in appPages" :key="p.pageKey" :index="'/app-mgmt/page/' + p.pageKey">
              <span>{{ p.title?.trim() ? p.title : p.pageKey }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu v-else-if="visibleChildren(item).length" :index="'/' + item.path">
            <template #title>
              <el-icon><component :is="item.meta?.icon" /></el-icon>
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in visibleChildren(item)"
              :key="child.path"
              :index="'/' + item.path + '/' + child.path"
            >
              <span>{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="'/' + item.path">
            <el-icon><component :is="item.meta?.icon" /></el-icon>
            <span>{{ item.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      <p v-if="appPagesError" class="menu-pages-error">{{ appPagesError }}</p>
    </el-aside>
    <el-container direction="vertical">
      <el-header class="layout-header">
        <div class="header-top">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="parentTitle">{{ parentTitle }}</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-button class="refresh-btn" :icon="RefreshRight" text @click="refreshCurrentPage">
              刷新
            </el-button>
            <el-dropdown trigger="click" @command="handleUserCommand">
              <span class="user-trigger">
                <el-icon><User /></el-icon>
                <span>{{ displayName }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div v-if="tabsStore.tabs.length" class="tab-row">
          <div
            v-for="t in tabsStore.tabs"
            :key="t.fullPath"
            class="tab-chip"
            :class="{ active: t.fullPath === route.fullPath }"
            @click="router.push(t.fullPath)"
          >
            <span class="tab-title">{{ t.title }}</span>
            <button type="button" class="tab-close" aria-label="关闭" @click.stop="handleCloseTab(t)">
              <el-icon class="tab-close-icon"><Close /></el-icon>
            </button>
          </div>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :max="MAX_TABS" :include="tabsStore.includeNames">
              <component
                v-if="Component"
                :is="wrappedComponent(Component)"
                :key="`${route.fullPath}:${tabRemountSeq[route.fullPath] ?? 0}`"
              />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="pwdDialogVisible" title="修改密码" width="420px" :close-on-click-modal="false">
    <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="pwdForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pwdDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="pwdLoading" @click="handleUpdatePassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { User, ArrowDown, RefreshRight, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useTabsStore, MAX_TABS, type AdminTabItem } from '@/stores/tabs'
import { getOrCreateTabWrapper } from '@/utils/tabViewWrapper'
import { updatePassword } from '@/api/auth'
import { useAppPageList } from '@/composables/useAppPageList'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const tabsStore = useTabsStore()
const { pages: appPages, loadError: appPagesError, fetchAppPages } = useAppPageList()

/** Per-tab remount counter so「刷新」can force a new instance without yanking KeepAlive `include` while still on the route (avoids DOM patch errors). */
const tabRemountSeq = reactive<Record<string, number>>({})

onMounted(() => {
  if (localStorage.getItem('token')) {
    fetchAppPages()
  }
  if (authStore.token && !authStore.admin) {
    void authStore.fetchUserInfo().catch(() => {})
  }
})

const displayName = computed(() => authStore.admin?.realName || authStore.admin?.username || '管理员')

const menuRoutes = computed(() => {
  const root = router.options.routes.find((r) => r.path === '/')
  return root?.children?.filter((r) => r.meta?.title && !r.meta?.hidden) ?? []
})

const visibleChildren = (item: RouteRecordRaw) =>
  item.children?.filter((c) => !c.meta?.hidden) ?? []

const activeMenu = computed(() => route.path)

const openedMenus = computed(() => {
  const matched = route.matched
  return matched.filter((r) => r.children?.length).map((r) => r.path)
})

const parentTitle = computed(() => {
  const matched = route.matched
  if (matched.length >= 3) {
    return matched[1].meta?.title as string
  }
  return ''
})

const currentTitle = computed(() => (route.meta?.title as string) ?? '仪表盘')

const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

async function handleUpdatePassword() {
  const valid = await pwdFormRef.value?.validate().catch(() => false)
  if (!valid) return
  pwdLoading.value = true
  try {
    await updatePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    pwdDialogVisible.value = false
    authStore.logout()
    router.push('/login')
  } catch {
    // error handled by interceptor
  } finally {
    pwdLoading.value = false
  }
}

function wrappedComponent(c: Component) {
  return getOrCreateTabWrapper(route.fullPath, c)
}

function handleCloseTab(t: AdminTabItem) {
  if (t.fullPath === route.fullPath && route.meta.hidden) {
    void tabsStore.closeCurrentHiddenTab()
  } else {
    void tabsStore.closeByFullPath(t.fullPath)
  }
}

function handleUserCommand(command: string) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
      .then(() => {
        authStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      })
      .catch(() => {})
  } else if (command === 'password') {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdDialogVisible.value = true
  }
}

function refreshCurrentPage() {
  const fp = route.fullPath
  tabRemountSeq[fp] = (tabRemountSeq[fp] ?? 0) + 1
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #1a1d24;
  overflow-x: hidden;
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #2d3038;
}

.menu-pages-error {
  margin: 8px 12px 0;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
}

.layout-menu {
  border-right: none;
}

.layout-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

.layout-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
}

.layout-header {
  height: auto;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  gap: 16px;
}

.tab-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin: 0 -20px;
  padding: 8px 16px 10px;
  overflow-x: auto;
  overflow-y: hidden;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.tab-row::-webkit-scrollbar {
  height: 5px;
}

.tab-row::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.tab-row::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.tab-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 220px;
  min-height: 32px;
  padding: 6px 4px 6px 12px;
  font-size: 13px;
  line-height: 1.3;
  color: #606266;
  background: #ebeef5;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.tab-chip:hover:not(.active) {
  color: #409eff;
  background: #e4e7ed;
  border-color: #dcdfe6;
}

.tab-chip.active {
  color: #303133;
  font-weight: 500;
  background: #fff;
  border-color: #dcdfe6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 2px;
}

.tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  padding: 4px;
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  border-radius: 4px;
  line-height: 0;
  transition:
    color 0.12s ease,
    background 0.12s ease;
}

.tab-close-icon {
  font-size: 12px;
}

.tab-chip.active .tab-close {
  color: #909399;
}

.tab-close:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.12);
}

.tab-chip.active .tab-close:hover {
  color: #f56c6c;
}

.header-right .user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn {
  margin-right: 12px;
}

.layout-main {
  background: #fff;
  padding: 12px 16px;
  overflow: auto;
  font-size: 15px;
  line-height: 1.55;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
