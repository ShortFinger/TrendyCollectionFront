# activity_card_grid CMS：内容项编辑简化与抽屉预览

**Date:** 2026-04-09  
**Scope:** TrendyCollectionFront — App 首页 / 页面 CMS（`app-home/index.vue`）中 **`activity_card_grid` 槽位** 的 **`activity_card_ref` 内容项** 编辑体验与序列化模型。

## 背景

运营在「活动卡片网格」槽位下添加/编辑内容项时，表单字段过多；内容项列表抽屉偏窄，预览信息不足。需在不动小程序端展示契约的前提下，收敛管理端表单与 payload 字段，并改善列表预览与布局。

## 目标

1. **表单**：从活动卡内容项编辑区移除以下仅展示或可选项：**售价（只读）**、**跳转类型**、**跳转 URL**、**作者**、**描述**、**点赞数**。
2. **抽屉**：加宽「内容项」侧拉抽屉，便于阅读表格与预览列。
3. **预览列**：在列表预览中**始终展示标题一行**；标题文本仅来自 CMS 覆盖字段 `payload.title`（trim 后非空则显示，否则显示占位 **「（未覆盖）」**）。
4. **数据层**：从 `ActivityCardRefPayload` / 编辑表单 / `buildActivityCardRefPayload` 中移除已删除字段；`parseActivityCardRefPayload` 读入历史 JSON 时**忽略**这些键（不进入表单）；保存时不再写出，使 payload 在下次保存时自然瘦身。

## 非目标

- 不改变 App 端对 `activity_card_ref` 的合并与展示逻辑（除非后续单独需求）。
- 不要求管理端在预览列中解析活动接口标题（不采用「无覆盖时显示活动原标题」方案）。

## UI 规格

### 添加/编辑内容项对话框（活动卡模式）

**移除：**

- 售价（只读）及关联展示。
- 描述、作者、点赞数、跳转类型、跳转 URL 表单项。

**保留：**

- 活动选择、活动 ID、可选覆盖中的 **标题**、**标签**。
- 方图/长图/角标/图集等媒体字段与现有 `MediaUpload` 行为。
- 渠道、生效时间、App 版本区间、排序等与其他内容类型共用的表单项。

**活动详情请求：** 选择或填写活动 ID 后仍可调用 `getActivity`，用于 **`backfillActivityAssetsIfEmpty`**（媒体回填）。**不得**再为「售价只读」维护 `moneyPrice` 展示状态。

### 内容项抽屉

- 将 `el-drawer` 的 `size` 从 `520px` 调整为 **`640px`**（实现时可微调 ±40px 以适配 Element Plus 与表格列宽，以设计意图「明显宽于当前」为准）。

### 表格「预览」列（活动卡行）

- 第一行：**活动 ID**（与现状一致，无则「—」）。
- 第二行：**标题** — `parseActivityCardRefPayload(row.payload).title` 经 trim 后非空则显示该字符串；否则显示 **「（未覆盖）」**。

## 数据与类型

### 从 `activity_card_ref` 编辑模型移除的键

`desc`、`author`、`likes`、`jumpType`、`jumpUrl`（以及表单/类型中与之对应的所有字段）。

售价从未写入 payload JSON（仅存只读展示），移除 UI 后不新增 payload 键。

### `appCmsPayload.ts`

- `ActivityCardRefPayload`、`ActivityCardRefEditorForm`、`defaultActivityCardRefPayload`、`buildActivityCardRefPayload`、`parseActivityCardRefPayload` 同步上述删减。
- **向后兼容：** 解析旧草稿/已发布 JSON 时，若存在已移除键，**忽略**即可；保存后新 JSON 不再包含这些键。

### 测试

- 更新 `appCmsPayload.spec.ts` 中与 `activity_card_ref` 往返、字段断言相关的用例。
- 回归：`npm test`（或项目约定的 Front 单测命令）通过。

## 验收标准

- [ ] 活动卡模式下上述表单项不可见；仍可保存活动 ID、标题/标签、媒体及通用项。
- [ ] 抽屉宽度达到约定加宽效果。
- [ ] 预览列始终含标题行，逻辑符合「仅覆盖标题 / 未覆盖占位」。
- [ ] 保存后的 `activity_card_ref` payload 不含已移除键；旧数据打开再保存后同步瘦身。
- [ ] 单测更新并通过。

## 实现后续

本 spec 确认后，使用 **writing-plans** 产出实现任务清单（不改代码直至计划评审约定）。
