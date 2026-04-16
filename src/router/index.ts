import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '@/layouts/Layout.vue'
import ParentView from '@/layouts/ParentView.vue'
import { useTabsStore, MAX_TABS } from '@/stores/tabs'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'goods',
        name: 'Goods',
        component: () => import('@/views/goods/index.vue'),
        meta: { title: '商品管理', icon: 'Goods' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/index.vue'),
        meta: { title: '订单管理', icon: 'List' },
      },
      {
        path: 'activity-orders',
        name: 'ActivityOrdersParent',
        component: ParentView,
        redirect: '/activity-orders/records',
        meta: { title: '活动订单', icon: 'Ticket' },
        children: [
          {
            path: 'records',
            name: 'ActivityRecords',
            component: () => import('@/views/activity-records/index.vue'),
            meta: { title: '活动记录' },
          },
        ],
      },
      {
        path: 'shipping',
        name: 'Shipping',
        component: () => import('@/views/shipping/index.vue'),
        meta: { title: '发货管理', icon: 'Van' },
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('@/views/warehouse/index.vue'),
        meta: { title: '盒柜仓库', icon: 'Box' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/index.vue'),
        meta: { title: '分类管理', icon: 'Grid' },
      },
      {
        path: 'media-gallery',
        name: 'MediaGallery',
        component: () => import('@/views/media-gallery/index.vue'),
        meta: { title: '素材库', icon: 'Picture' },
      },
      {
        path: 'gameplay',
        name: 'Gameplay',
        component: ParentView,
        redirect: '/gameplay/ichiban',
        meta: { title: '玩法管理', icon: 'Trophy' },
        children: [
          {
            path: 'ichiban',
            name: 'GameplayIchiban',
            component: () => import('@/views/gameplay/ichiban/index.vue'),
            meta: { title: '一番赏' },
          },
          {
            path: 'ichiban/:activityId/boxes',
            name: 'IchibanBoxes',
            component: () => import('@/views/gameplay/ichiban/boxes.vue'),
            meta: { title: '编辑箱子', hidden: true },
          },
          {
            path: 'unlimited',
            name: 'GameplayUnlimited',
            component: () => import('@/views/gameplay/unlimited/index.vue'),
            meta: { title: '无限赏' },
          },
          {
            path: 'unlimited/:activityId/boxes',
            name: 'UnlimitedBoxes',
            component: () => import('@/views/gameplay/ichiban/boxes.vue'),
            meta: { title: '编辑箱子', hidden: true },
          },
          {
            path: 'gacha',
            name: 'GameplayGacha',
            component: () => import('@/views/gameplay/gacha/index.vue'),
            meta: { title: '抽卡机' },
          },
          {
            path: 'gacha/:activityId/prizes',
            name: 'GachaPrizes',
            component: () => import('@/views/gameplay/gacha/prizes.vue'),
            meta: { title: '编辑奖品', hidden: true },
          },
        ],
      },
      {
        path: 'users',
        name: 'Users',
        component: ParentView,
        redirect: '/users/list',
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/users/list/index.vue'),
            meta: { title: '用户列表' },
          },
          {
            path: 'score-ledgers',
            name: 'UserScoreLedgers',
            component: () => import('@/views/users/score-ledgers/index.vue'),
            meta: { title: '积分记录' },
          },
          {
            path: 'mithril-ledgers',
            name: 'UserMithrilLedgers',
            component: () => import('@/views/users/mithril-ledgers/index.vue'),
            meta: { title: '秘银记录' },
          },
          {
            path: 'virtual-users',
            name: 'VirtualUsers',
            component: () => import('@/views/users/virtual-users/index.vue'),
            meta: { title: '虚拟用户' },
          },
          {
            path: 'virtual-user-rules',
            name: 'VirtualUserRules',
            component: () => import('@/views/users/virtual-user-rules/index.vue'),
            meta: { title: '虚拟投放规则' },
          },
          {
            path: 'virtual-user-logs',
            name: 'VirtualUserLogs',
            component: () => import('@/views/users/virtual-user-logs/index.vue'),
            meta: { title: '虚拟陪跑日志' },
          },
        ],
      },
      {
        path: 'welfare',
        name: 'Welfare',
        component: ParentView,
        redirect: '/welfare/overview',
        meta: { title: '福利管理', icon: 'Gift' },
        children: [
          {
            path: 'overview',
            name: 'WelfareOverview',
            component: () => import('@/views/welfare/overview/index.vue'),
            meta: { title: '概览' },
          },
        ],
      },
      {
        path: 'rankings',
        name: 'Rankings',
        component: ParentView,
        redirect: '/rankings/total-recharge',
        meta: { title: '排行榜', icon: 'TrendCharts' },
        children: [
          {
            path: 'total-recharge',
            name: 'TotalRecharge',
            component: () => import('@/views/rankings/total-recharge/index.vue'),
            meta: { title: '总充值排行榜' },
          },
          {
            path: 'today-recharge',
            name: 'TodayRecharge',
            component: () => import('@/views/rankings/today-recharge/index.vue'),
            meta: { title: '今日充值排行榜' },
          },
        ],
      },
      {
        path: 'growth',
        name: 'Growth',
        component: ParentView,
        redirect: '/growth/tasks',
        meta: { title: '成长管理', icon: 'DataAnalysis' },
        children: [
          {
            path: 'tasks',
            name: 'GrowthTasks',
            component: () => import('@/views/growth/tasks/index.vue'),
            meta: { title: '成长任务' },
          },
          {
            path: 'details',
            name: 'GrowthDetails',
            component: () => import('@/views/growth/details/index.vue'),
            meta: { title: '成长明细' },
          },
        ],
      },
      {
        path: 'app-mgmt',
        name: 'AppMgmt',
        component: ParentView,
        redirect: '/app-mgmt/page/home',
        meta: { title: 'APP管理', icon: 'Iphone' },
        children: [
          {
            path: 'page-create',
            name: 'AppPageCreate',
            component: () => import('@/views/app-page-create/index.vue'),
            meta: { title: '新增页面', hidden: true },
          },
          {
            path: 'global',
            name: 'AppGlobalConfig',
            component: () => import('@/views/app-home/index.vue'),
            meta: { title: '通用配置' },
          },
          {
            path: 'page/:pageKey',
            name: 'AppPageEditor',
            component: () => import('@/views/app-home/index.vue'),
            meta: { title: 'APP 页面', hidden: true },
          },
          {
            path: 'home',
            redirect: '/app-mgmt/page/home',
            meta: { hidden: true },
          },
        ],
      },
      {
        path: 'app-home',
        redirect: '/app-mgmt/page/home',
      },
      {
        path: 'settings',
        name: 'Settings',
        component: ParentView,
        redirect: '/settings/permissions',
        meta: { title: '系统设置', icon: 'Setting' },
        children: [
          {
            path: 'permissions',
            name: 'Permissions',
            component: () => import('@/views/settings/permissions/index.vue'),
            meta: { title: '权限设置' },
          },
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('@/views/settings/roles/index.vue'),
            meta: { title: '角色设置' },
          },
          {
            path: 'staff',
            name: 'Staff',
            component: () => import('@/views/settings/staff/index.vue'),
            meta: { title: '人员设置' },
          },
          {
            path: 'sys-settings',
            name: 'SysSettings',
            component: () => import('@/views/settings/sys-settings/index.vue'),
            meta: { title: '设置项' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.public) {
    if (token && to.path === '/login') {
      next('/')
    } else {
      next()
    }
    return
  }
  if (!token) {
    next('/login')
    return
  }
  if (to.matched.length >= 2) {
    const tabsStore = useTabsStore()
    if (!tabsStore.has(to.fullPath) && tabsStore.tabs.length >= MAX_TABS) {
      ElMessage.warning('最多打开 20 个标签页')
      next(false)
      return
    }
  }
  next()
})

router.afterEach((to) => {
  const tabsStore = useTabsStore()
  tabsStore.syncFromRoute(to)
  tabsStore.updateTitle(to)
})

export default router
