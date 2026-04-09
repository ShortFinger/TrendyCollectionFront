# activity_card_grid CMS UI 简化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理端收敛 `activity_card_ref` 编辑表单与 payload 字段，加宽内容项抽屉，并在列表预览中固定展示标题行（覆盖标题或「（未覆盖）」占位）。

**Architecture:** 在 `appCmsPayload.ts` 中删减 `ActivityCardRefPayload` / 表单类型及 `build`/`parse` 中对已废弃键的读写；`index.vue` 删除对应表单项与售价只读逻辑，保留 `getActivity` + `backfillActivityAssetsIfEmpty`；抽屉与预览仅改模板与局部辅助函数。

**Tech Stack:** Vue 3、TypeScript、Element Plus、`vitest`。

**Spec:** [2026-04-09-activity-card-grid-cms-ui-design.md](../specs/2026-04-09-activity-card-grid-cms-ui-design.md)

---

## File map

| File | Role |
|------|------|
| `src/utils/appCmsPayload.ts` | `activity_card_ref` 类型与 `buildActivityCardRefPayload` / `parseActivityCardRefPayload` |
| `src/utils/appCmsPayload.spec.ts` | 单测：往返与遗留 JSON 忽略 |
| `src/views/app-home/index.vue` | 活动卡表单项、抽屉 `size`、预览列、`readonlyActivityMoneyPrice` 等清理 |

---

### Task 1: `activity_card_ref` 数据层与单测（先测后实现）

**Files:**

- Modify: `TrendyCollectionFront/src/utils/appCmsPayload.spec.ts`
- Modify: `TrendyCollectionFront/src/utils/appCmsPayload.ts`
- Test: `TrendyCollectionFront/src/utils/appCmsPayload.spec.ts`

- [ ] **Step 1: 更新/新增单测（当前实现应失败或无法通过类型检查）**

在 `appCmsPayload.spec.ts` 中：

1. 将 `roundtrips activity_card_ref asset fields` 里传给 `buildActivityCardRefPayload` 的对象改为**不再包含** `desc`、`author`、`likes`、`jumpType`、`jumpUrl`（与即将删除的表单字段一致）；`toMatchObject` 断言中也去掉这些键。

2. 新增用例 `parse ignores legacy keys on activity_card_ref`：

```ts
it('parse ignores legacy keys on activity_card_ref', () => {
  const raw =
    '{"activityId":"a1","desc":"old","author":"x","likes":3,"jumpType":"page","jumpUrl":"/p","title":"T"}'
  const parsed = parseActivityCardRefPayload(raw)
  expect(parsed.activityId).toBe('a1')
  expect(parsed.title).toBe('T')
  expect(Object.keys(parsed)).not.toContain('desc')
  expect(Object.keys(parsed)).not.toContain('author')
})
```

（若 `ActivityCardRefEditorForm` 仍含已删键则本步先不通过 `not.toContain`；实现删类型后再满足。）

- [ ] **Step 2: 运行测试，确认失败**

Run:

```bash
cd TrendyCollectionFront && npm test
```

Expected: 失败——`buildActivityCardRefPayload` 参数缺少旧字段、或类型不匹配；或新断言与旧 `parse` 行为不一致。

- [ ] **Step 3: 实现 `appCmsPayload.ts` 删减**

1. 从 `ActivityCardRefPayload` 中删除：`desc`、`author`、`likes`、`jumpType`、`jumpUrl`。

2. 从 `ActivityCardRefEditorForm` 与 `defaultActivityCardRefPayload()` 中删除同上字段。

3. `buildActivityCardRefPayload`：删除对上述字段的 `pick` 与 `out.xxx` 赋值。

4. `parseActivityCardRefPayload`：解析 `Partial<ActivityCardRefPayload>` 时**不要**把已删除键写回返回对象；`likes` 等解析逻辑删除。

- [ ] **Step 4: 再次运行测试**

Run: `cd TrendyCollectionFront && npm test`  
Expected: 全部通过。

- [ ] **Step 5: 提交（若仓库已初始化 git）**

```bash
git add src/utils/appCmsPayload.ts src/utils/appCmsPayload.spec.ts
git commit -m "refactor(cms): slim activity_card_ref payload types and serialization"
```

---

### Task 2: `app-home` 页面 UI 与脚本对齐 spec

**Files:**

- Modify: `TrendyCollectionFront/src/views/app-home/index.vue`

- [ ] **Step 1: 删除活动卡表单项**

在 `<template>` 中 `isActivityItemMode` 分支内删除：

- `el-form-item`「售价（只读）」整块；
- 「可选覆盖」下：`描述`、`作者`、`点赞数`、`跳转类型`、`跳转 URL` 的 `el-form-item`。

保留：`活动`、`活动 ID`、`标题`、`标签`、媒体网格及后续通用表单项。

- [ ] **Step 2: 加宽内容项抽屉**

将 `<el-drawer ... size="520px">` 改为 `size="640px"`。

- [ ] **Step 3: 预览列固定显示标题行**

将活动卡预览模板改为始终渲染第二行标题，例如：

```vue
<div class="preview-activity">
  <div class="preview-activity-id">{{ activityCardPreview(row).activityId || '—' }}</div>
  <div class="preview-activity-title">{{ activityCardPreview(row).titleDisplay }}</div>
</div>
```

在 `<script>` 中把 `activityCardPreview` 改为返回：

```ts
function activityCardPreview(row: EditorItemRow) {
  const p = parseActivityCardRefPayload(row.payload)
  const activityId = p.activityId.trim()
  const title = (p.title ?? '').trim()
  return {
    activityId,
    titleDisplay: title || '（未覆盖）',
  }
}
```

删除仅用于 `title` 的 `v-if`，避免第二行缺失。

- [ ] **Step 4: 移除售价只读状态与赋值**

1. 删除 `readonlyActivityMoneyPrice`、`activityMoneyPriceDisplay` 的 `ref` / `computed`。

2. 在 `refreshActivityData` 中：删除所有 `readonlyActivityMoneyPrice` 赋值；`id` 为空时直接 `return`（不调 API）；成功分支保留 `ensureActivityOption(data)`、`backfillActivityAssetsIfEmpty(data)`；`catch` 中不再设置售价。

3. 在 `onActivitySelectChange`：空 `id` 时仅 `return`，删除售价清空。

4. 在 `openItemDialog`：删除开头的 `readonlyActivityMoneyPrice.value = null`；删除编辑活动时 `getActivity` 异步块里对 `readonlyActivityMoneyPrice` 的赋值（可保留 `ensureActivityOption` + 若需与 `refreshActivityData` 一致，仅调用 `refreshActivityData(aid)` 代替重复逻辑——**YAGNI**：最小改动为删掉 money 行并保留现有 `getActivity` 仅用于 `ensureActivityOption`，或改为 `await refreshActivityData(aid)` 统一回填资源与选项，二选一以 diff 最小为准）。

5. 在 `resetItemForm`：删除 `readonlyActivityMoneyPrice.value = null`。

- [ ] **Step 5: 类型检查与测试**

Run:

```bash
cd TrendyCollectionFront && npm test && npm run build
```

Expected: `vitest` 通过；`vue-tsc` + `vite build` 无错误。

- [ ] **Step 6: 提交（若仓库已初始化 git）**

```bash
git add src/views/app-home/index.vue
git commit -m "feat(cms): simplify activity card editor, widen items drawer, preview title"
```

---

## Spec coverage（自检）

| Spec 要求 | Task |
|-----------|------|
| 移除售价只读、描述、作者、点赞、跳转类型/URL | Task 2 Step 1、4 |
| 抽屉加宽至 640px | Task 2 Step 2 |
| 预览列活动 ID + 标题行，无覆盖为「（未覆盖）」 | Task 2 Step 3 |
| payload 类型与 build/parse 不含已删键；遗留 JSON 忽略 | Task 1 |
| `getActivity` 仍用于媒体回填 | Task 2 Step 4（保留 `refreshActivityData` 核心） |
| 单测与 build 通过 | Task 1 Step 4、Task 2 Step 5 |

## Placeholder scan

无 TBD；任务含具体文件与命令。

---

**Plan complete and saved to** `TrendyCollectionFront/docs/superpowers/plans/2026-04-09-activity-card-grid-cms-ui.md`.

**Two execution options:**

1. **Subagent-Driven（推荐）** — 每个 Task 派生子代理，任务间评审，迭代快  
2. **Inline Execution** — 本会话按 `executing-plans` 连续执行并设检查点  

你更倾向哪一种？若无需选择，可直接说「开始实现」，我将在本会话按 Task 1 → Task 2 落地代码并运行 `npm test` / `npm run build`。
