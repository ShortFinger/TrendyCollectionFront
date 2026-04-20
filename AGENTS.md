# TrendyCollectionFront — Agent / 协作者说明

## 项目是什么

**TrendyCollection 电商管理端**：运营/后台使用的 Web 管理界面。

## 技术栈

- Vue 3（Composition API）
- TypeScript
- Vite 5
- Vue Router 4、Pinia
- Element Plus（中文语言包）、`@element-plus/icons-vue`
- Axios、jsencrypt、ali-oss（与上传/资源相关能力）

## 目录地图

| 路径 | 说明 |
|------|------|
| `src/views/` | 业务页面（仪表盘、商品、订单、用户、设置等） |
| `src/layouts/` | 布局（侧栏、顶栏） |
| `src/router/` | 路由 |
| `src/styles/` | 全局样式 |
| `src/` 根下 | `App.vue`、`main.ts` 等入口 |
| `vite.config.ts` | 构建与 **开发代理** |
| `public/` | 静态资源 |

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## 开发服务与代理

- 本地开发：`npm run dev`，默认 **http://localhost:5173**
- `vite.config.ts` 中已将：
  - `/admin-api` 代理到 `http://localhost:8081`（与后端 `TrendyCollectionAdmin` 的 context-path 对齐）
  - `/order-admin-api` 代理到 `http://localhost:8082`（与 `TrendyCollectionOrderAdmin` 对齐）

联调时请确保对应后端进程已启动，或按需改 `target`。

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

## 约定与注意

- 接口调用应走统一封装（axios 实例、拦截器等），避免在组件内写死完整后端 URL（开发期可走上述代理路径）。
- 构建前类型检查：`npm run build` 内含 `vue-tsc`。
- 仓库内另有脚本如 `check-schema.mjs`、`seed-data.mjs`、`verify-data.mjs`：改库表或种子数据前先读脚本注释再执行。

## 延伸阅读

- `README.md`：功能模块与结构说明（若与代码不一致，以代码为准并更新 README）。
