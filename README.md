# TrendyCollection 电商管理端

基于 Vue 3 + TypeScript + Vite + Element Plus 的电商后台管理系统。

## 技术栈

- **Vue 3** - Composition API
- **TypeScript**
- **Vite** - 构建工具
- **Vue Router** - 路由
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库

## 功能模块

- 仪表盘：概览数据与快捷入口
- 商品管理：商品列表、新增/编辑/删除（待接接口）
- 订单管理：订单列表、筛选、详情（待接接口）
- 用户管理：用户列表（待接接口）
- 系统设置：占位，待扩展

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev

# 构建生产
npm run build

# 预览生产构建
npm run preview
```

开发服务默认运行在 http://localhost:5173

## 项目结构

```
src/
├── layouts/       # 布局（侧栏、顶栏）
├── router/        # 路由配置
├── views/         # 页面
│   ├── dashboard/
│   ├── goods/
│   ├── orders/
│   ├── users/
│   └── settings/
├── styles/        # 全局样式
├── App.vue
└── main.ts
```

## 后续可做

- 接入后端 API（axios + 统一请求封装）
- 登录页与鉴权（路由守卫、Token）
- 商品分类、规格、上下架
- 订单详情、发货、退款
- 数据统计图表（如 ECharts）
