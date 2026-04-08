<template>
  <div class="app-home-page">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="status">
          <span class="label">已发布版本</span>
          <el-tag type="info">{{ state?.page?.publishedRevision ?? '—' }}</el-tag>
          <span class="label">草稿版本</span>
          <el-tag type="warning">{{ state?.page?.draftRevision ?? '—' }}</el-tag>
          <span v-if="state?.page?.title" class="scene-title">{{ state.page.title }}</span>
        </div>
        <div class="actions">
          <el-button @click="load" :loading="loading">刷新</el-button>
          <el-button type="primary" plain @click="doFork" :loading="forking">从已发布版本拉取草稿</el-button>
          <el-button type="success" @click="doPublish" :loading="publishing">发布</el-button>
        </div>
      </div>
      <el-alert type="info" :closable="false" show-icon class="hint" title="发布成功后，C 端 App 因缓存可能存在短延迟后才看见最新内容。" />
      <el-alert
        v-if="route.name === 'AppGlobalConfig'"
        type="info"
        :closable="false"
        show-icon
        class="hint"
        title="本页为全 App 组件默认值；若某页面在 CMS 中配置了相同类型的槽位，则以该页面为准。"
      />
      <el-alert v-if="pageNotFound" type="warning" :closable="false" show-icon class="hint-not-found">
        该 pageKey 尚未建立或已被刪除。請前往
        <router-link to="/app-mgmt/page-create">新增页面</router-link>
        建立页面后再次尝试。
      </el-alert>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-head">
          <span>槽位（页面 {{ pageDisplayLabel }}，草稿）</span>
          <el-button type="primary" :icon="Plus" @click="openAddSlot">添加槽位</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="sortedSlots" row-key="id" border>
        <el-table-column label="顺序" width="72" align="center">
          <template #default="{ $index }">
            <span>{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="slotType" label="类型" width="120">
          <template #default="{ row }">
            {{ slotLabel(row.slotType) }}
          </template>
        </el-table-column>
        <el-table-column label="编码" width="160">
          <template #default="{ row }">
            <span class="slot-type-code">{{ row.slotType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="sortOrder" width="100" />
        <el-table-column label="内容项数" width="100" align="center">
          <template #default="{ row }">
            {{ row.items?.length ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openItemsDrawer(row)">内容项</el-button>
            <el-button link :disabled="$index === 0" @click="moveSlot($index, -1)">上移</el-button>
            <el-button link :disabled="$index === sortedSlots.length - 1" @click="moveSlot($index, 1)">
              下移
            </el-button>
            <el-button
              link
              type="danger"
              :loading="slotDeletingId === row.id"
              @click="confirmDeleteSlot(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="slotDialogVisible" title="添加槽位" width="420px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="类型">
          <el-select v-model="newSlotType" style="width: 100%">
            <el-option
              v-for="opt in enabledSlotTypeOptions"
              :key="opt.code"
              :label="`${opt.label}（${opt.code}）`"
              :value="opt.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="slotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="slotSaving" @click="submitNewSlot">确定</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" :title="`内容项 — ${slotLabel(activeSlot?.slotType ?? '')}`" size="520px">
      <div class="drawer-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="openItemDialog(null)">添加内容项</el-button>
      </div>
      <el-table :data="activeSlot?.items ?? []" size="small" border>
        <el-table-column prop="sortOrder" label="序" width="56" />
        <el-table-column label="预览" width="160">
          <template #default="{ row }">
            <template v-if="row.contentType === 'activity_card_ref'">
              <div class="preview-activity">
                <div class="preview-activity-id">{{ activityCardPreview(row).activityId || '—' }}</div>
                <div v-if="activityCardPreview(row).title" class="preview-activity-title">
                  {{ activityCardPreview(row).title }}
                </div>
              </div>
            </template>
            <AppCmsVisualImagePreview
              v-else-if="parsePayload(row.payload).imageUrl"
              :image-ref="parsePayload(row.payload).imageUrl"
            />
          </template>
        </el-table-column>
        <el-table-column prop="contentType" label="类型" width="110" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openItemDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-dialog v-model="itemDialogVisible" :title="editingItemId ? '编辑内容项' : '添加内容项'" width="620px" destroy-on-close
      @closed="resetItemForm">
      <el-form :model="itemForm" label-width="110px">
        <template v-if="isActivityItemMode">
          <el-form-item label="活动" required>
            <el-select
              v-model="activityCardForm.activityId"
              class="activity-select"
              filterable
              remote
              clearable
              reserve-keyword
              placeholder="搜索标题或选择活动"
              :remote-method="remoteSearchActivities"
              :loading="activitySearchLoading"
              @change="onActivitySelectChange"
            >
              <el-option
                v-for="a in activityOptions"
                :key="a.id"
                :label="`${a.title} (${a.id})`"
                :value="a.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="活动 ID">
            <el-input v-model="activityCardForm.activityId" placeholder="可手填或由上栏选择" @blur="onActivityIdBlur" />
          </el-form-item>
          <el-form-item label="售价（只读）">
            <el-input :model-value="activityMoneyPriceDisplay" disabled placeholder="选择活动后显示 moneyPrice" />
          </el-form-item>
          <el-divider content-position="left">可选覆盖</el-divider>
          <el-form-item label="标题">
            <el-input v-model="activityCardForm.title" placeholder="覆盖活动标题" />
          </el-form-item>
          <el-form-item label="封面 URL">
            <el-input v-model="activityCardForm.coverUrl" placeholder="覆盖 squareThumb 等" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="activityCardForm.tag" placeholder="覆盖展示标签" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="activityCardForm.desc" type="textarea" :rows="2" placeholder="可选" />
          </el-form-item>
          <el-form-item label="作者">
            <el-input v-model="activityCardForm.author" placeholder="可选" />
          </el-form-item>
          <el-form-item label="点赞数">
            <el-input v-model="activityCardForm.likes" placeholder="可选数字" />
          </el-form-item>
          <el-form-item label="跳转类型">
            <el-input v-model="activityCardForm.jumpType" placeholder="可选" />
          </el-form-item>
          <el-form-item label="跳转 URL">
            <el-input v-model="activityCardForm.jumpUrl" placeholder="可选 path 或 H5" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="图片">
            <MediaUpload v-model="visualForm.imageUrl" :dir="`pages/${pageKey}`" />
          </el-form-item>
          <el-form-item label="链接">
            <el-input v-model="visualForm.linkUrl" placeholder="可选，小程序 path 或 H5" />
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="visualForm.title" placeholder="可选" />
          </el-form-item>
        </template>
        <el-form-item label="渠道">
          <el-select v-model="itemForm.channel" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option label="微信小程序" value="mp-weixin" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="itemTimeRange" type="datetimerange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="App 最低版本">
          <el-input v-model="itemForm.minAppVersion" placeholder="可选，如 1.0.0" />
        </el-form-item>
        <el-form-item label="App 最高版本">
          <el-input v-model="itemForm.maxAppVersion" placeholder="可选，如 1.0.0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="submitItem">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchEditorState,
  forkDraft,
  publishPage,
  createSlot,
  updateSlot,
  deleteSlot,
  createItem,
  updateItem,
} from '@/api/appCms'
import { fetchActivityList, getActivity } from '@/api/activity'
import MediaUpload from '@/components/MediaUpload.vue'
import AppCmsVisualImagePreview from '@/components/AppCmsVisualImagePreview.vue'
import type { ActivityVO } from '@/types/activity'
import type { EditorSlotRow, EditorItemRow, EditorStateResponse } from '@/types/appCms'
import {
  activityItemModeFromCatalog,
  buildPayload,
  parsePayload,
  validateVisualPayload,
  defaultContentTypeForSlot,
  findCatalogEntry,
  defaultPayload,
  defaultActivityCardRefPayload,
  buildActivityCardRefPayload,
  parseActivityCardRefPayload,
  validateActivityCardRefPayload,
  slotLabelFromCatalog,
  type VisualPayload,
} from '@/utils/appCmsPayload'

const route = useRoute()
const pageKey = computed(() => {
  if (route.name === 'AppGlobalConfig') return '_global'
  const k = route.params.pageKey
  return typeof k === 'string' ? k : Array.isArray(k) ? (k[0] ?? '') : ''
})

const loading = ref(false)
const forking = ref(false)
const publishing = ref(false)
const state = ref<EditorStateResponse | null>(null)
const pageNotFound = ref(false)

const pageDisplayLabel = computed(() => {
  const t = state.value?.page?.title?.trim()
  if (t) return t
  return pageKey.value
})

const slotTypeCatalog = computed(() => state.value?.slotTypeCatalog ?? [])

const enabledSlotTypeOptions = computed(() => slotTypeCatalog.value.filter((e) => e.enabled))

const slotDialogVisible = ref(false)
const newSlotType = ref<string>('')
const slotSaving = ref(false)
const slotDeletingId = ref<number | null>(null)

const drawerVisible = ref(false)
const activeSlot = ref<EditorSlotRow | null>(null)

const itemDialogVisible = ref(false)
const itemSaving = ref(false)
const editingItemId = ref<number | null>(null)
const visualForm = ref<VisualPayload>(defaultPayload())
const activityCardForm = ref(defaultActivityCardRefPayload())
const activityOptions = ref<ActivityVO[]>([])
const activitySearchLoading = ref(false)
const readonlyActivityMoneyPrice = ref<number | null>(null)
const itemTimeRange = ref<[string, string] | null>(null)
/** Jackson `LocalDateTime` JSON uses `T` between date and time; space-separated strings fail to parse. */
function toPickerLocalDateTime(raw: string): string {
  let s = raw.trim()
  if (!s) return s
  if (!s.includes('T'))
    s = s.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/, '$1T$2')
  const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/.exec(s)
  return m ? m[1] : s
}
const itemForm = ref({
  sortOrder: 0,
  channel: 'all',
  minAppVersion: '' as string,
  maxAppVersion: '' as string,
})

const sortedSlots = computed(() => {
  const slots = state.value?.slots ?? []
  return [...slots].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
})

function slotLabel(type: string) {
  return slotLabelFromCatalog(slotTypeCatalog.value, type)
}

function activityCardPreview(row: EditorItemRow) {
  const p = parseActivityCardRefPayload(row.payload)
  return { activityId: p.activityId.trim(), title: p.title?.trim() || '' }
}

const activityMoneyPriceDisplay = computed(() =>
  readonlyActivityMoneyPrice.value == null ? '' : String(readonlyActivityMoneyPrice.value),
)

/** 活动卡片表单项：目录约定或编辑中的项为 activity_card_ref */
const isActivityItemMode = computed(() => {
  const slot = activeSlot.value
  if (!slot) return false
  const item =
    editingItemId.value != null ? slot.items?.find((i) => i.id === editingItemId.value) : null
  return activityItemModeFromCatalog(slotTypeCatalog.value, slot.slotType, item?.contentType)
})

async function refreshActivityMoneyPrice(activityId: string) {
  const id = activityId.trim()
  if (!id) {
    readonlyActivityMoneyPrice.value = null
    return
  }
  try {
    const { data } = await getActivity(id)
    readonlyActivityMoneyPrice.value = data.moneyPrice ?? null
  } catch {
    readonlyActivityMoneyPrice.value = null
  }
}

function ensureActivityOption(row: ActivityVO) {
  if (!activityOptions.value.some((a) => a.id === row.id)) {
    activityOptions.value = [row, ...activityOptions.value]
  }
}

async function remoteSearchActivities(query: string) {
  activitySearchLoading.value = true
  try {
    const { data } = await fetchActivityList({
      keyword: query?.trim() || undefined,
      page: 1,
      size: 15,
    })
    activityOptions.value = data.records ?? []
  } finally {
    activitySearchLoading.value = false
  }
}

async function onActivitySelectChange(id: string | null | undefined) {
  if (!id?.trim()) {
    readonlyActivityMoneyPrice.value = null
    return
  }
  await refreshActivityMoneyPrice(id)
}

async function onActivityIdBlur() {
  await refreshActivityMoneyPrice(activityCardForm.value.activityId)
}

async function load() {
  if (!pageKey.value) {
    state.value = null
    pageNotFound.value = false
    return
  }
  loading.value = true
  pageNotFound.value = false
  try {
    const res = await fetchEditorState(pageKey.value)
    state.value = res.data
  } catch (e: unknown) {
    state.value = null
    const msg =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: string }).message ?? '')
        : ''
    if (msg.includes('页面不存在') || msg.includes('页面未建立')) {
      pageNotFound.value = true
      ElMessage.error('页面不存在，可透过侧栏「新增页面」建立此 pageKey')
    }
  } finally {
    loading.value = false
  }
}

watch(
  pageKey,
  (k) => {
    if (k) load()
    else {
      state.value = null
      pageNotFound.value = false
    }
  },
  { immediate: true },
)

async function doFork() {
  forking.value = true
  try {
    await forkDraft(pageKey.value)
    ElMessage.success('已拉取草稿')
    await load()
  } finally {
    forking.value = false
  }
}

async function doPublish() {
  try {
    await ElMessageBox.confirm('确定将当前草稿发布为线上版本？', '发布', { type: 'warning' })
  } catch {
    return
  }
  publishing.value = true
  try {
    await publishPage(pageKey.value)
    ElMessage.success('发布成功')
    await load()
  } finally {
    publishing.value = false
  }
}

function openAddSlot() {
  const opts = enabledSlotTypeOptions.value
  if (!opts.length) {
    ElMessage.warning('暂无可用槽位类型，请检查系统配置')
    return
  }
  newSlotType.value = opts[0]!.code
  slotDialogVisible.value = true
}

async function submitNewSlot() {
  const nextOrder =
    sortedSlots.value.reduce((m, s) => Math.max(m, s.sortOrder ?? 0), -1) + 1
  slotSaving.value = true
  try {
    await createSlot(pageKey.value, { slotType: newSlotType.value, sortOrder: nextOrder })
    ElMessage.success('已添加槽位')
    slotDialogVisible.value = false
    await load()
  } finally {
    slotSaving.value = false
  }
}

async function confirmDeleteSlot(row: EditorSlotRow) {
  const n = row.items?.length ?? 0
  try {
    await ElMessageBox.confirm(
      `确定删除槽位「${slotLabel(row.slotType)}」（${row.slotType}）？其下 ${n} 个内容项将一并删除，且不可恢复。`,
      '删除槽位',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  slotDeletingId.value = row.id
  try {
    await deleteSlot(pageKey.value, row.id)
    ElMessage.success('已删除槽位')
    if (activeSlot.value?.id === row.id) {
      activeSlot.value = null
      drawerVisible.value = false
    }
    await load()
  } finally {
    slotDeletingId.value = null
  }
}

async function moveSlot(index: number, delta: number) {
  const list = sortedSlots.value
  const j = index + delta
  if (j < 0 || j >= list.length) return
  const a = list[index]
  const b = list[j]
  const orderA = a.sortOrder ?? 0
  const orderB = b.sortOrder ?? 0
  try {
    await updateSlot(pageKey.value, a.id, { sortOrder: orderB })
    await updateSlot(pageKey.value, b.id, { sortOrder: orderA })
    ElMessage.success('已调整顺序')
    await load()
  } catch {
    // interceptor
  }
}

function openItemsDrawer(slot: EditorSlotRow) {
  activeSlot.value = slot
  drawerVisible.value = true
}

function openItemDialog(item: EditorItemRow | null) {
  editingItemId.value = item?.id ?? null
  activityOptions.value = []
  readonlyActivityMoneyPrice.value = null

  const slot = activeSlot.value
  const treatAsActivity =
    !!slot && activityItemModeFromCatalog(slotTypeCatalog.value, slot.slotType, item?.contentType)

  if (item) {
    itemForm.value.sortOrder = item.sortOrder ?? 0
    itemForm.value.channel = item.channel?.trim() ? item.channel : 'all'
    itemForm.value.minAppVersion = item.minAppVersion ?? ''
    itemForm.value.maxAppVersion = item.maxAppVersion ?? ''
    if (item.startTime && item.endTime) {
      itemTimeRange.value = [toPickerLocalDateTime(item.startTime), toPickerLocalDateTime(item.endTime)]
    } else {
      itemTimeRange.value = null
    }
    if (treatAsActivity) {
      activityCardForm.value = parseActivityCardRefPayload(item.payload)
      const aid = activityCardForm.value.activityId.trim()
      if (aid) {
        void (async () => {
          try {
            const { data } = await getActivity(aid)
            ensureActivityOption(data)
            readonlyActivityMoneyPrice.value = data.moneyPrice ?? null
          } catch {
            readonlyActivityMoneyPrice.value = null
          }
        })()
      }
      visualForm.value = defaultPayload()
    } else {
      visualForm.value = parsePayload(item.payload)
      activityCardForm.value = defaultActivityCardRefPayload()
    }
  } else {
    visualForm.value = defaultPayload()
    activityCardForm.value = defaultActivityCardRefPayload()
    itemForm.value = {
      sortOrder: activeSlot.value?.items?.length ?? 0,
      channel: 'all',
      minAppVersion: '',
      maxAppVersion: '',
    }
    itemTimeRange.value = null
  }
  itemDialogVisible.value = true
}

function resetItemForm() {
  editingItemId.value = null
  visualForm.value = defaultPayload()
  activityCardForm.value = defaultActivityCardRefPayload()
  activityOptions.value = []
  readonlyActivityMoneyPrice.value = null
  itemTimeRange.value = null
}

async function submitItem() {
  const slot = activeSlot.value
  if (!slot) {
    ElMessage.warning('请先选择槽位')
    return
  }
  if (!findCatalogEntry(slotTypeCatalog.value, slot.slotType)) {
    ElMessage.error('配置中无该槽位类型')
    return
  }

  const activityMode = activityItemModeFromCatalog(
    slotTypeCatalog.value,
    slot.slotType,
    editingItemId.value != null
      ? slot.items?.find((i) => i.id === editingItemId.value)?.contentType
      : null,
  )

  let contentType: string
  let payloadJson: string

  if (activityMode) {
    const errA = validateActivityCardRefPayload(activityCardForm.value)
    if (errA) {
      ElMessage.error(errA)
      return
    }
    contentType = 'activity_card_ref'
    payloadJson = buildActivityCardRefPayload(activityCardForm.value)
  } else {
    const err = validateVisualPayload(visualForm.value)
    if (err) {
      ElMessage.error(err)
      return
    }
    const dct = defaultContentTypeForSlot(slotTypeCatalog.value, slot.slotType)
    if (!dct) {
      ElMessage.error('无法解析该槽位的默认内容类型')
      return
    }
    contentType = dct
    payloadJson = buildPayload(visualForm.value)
  }

  const body: Record<string, unknown> = {
    sortOrder: itemForm.value.sortOrder,
    contentType,
    payload: payloadJson,
    channel: itemForm.value.channel || 'all',
    minAppVersion: itemForm.value.minAppVersion || null,
    maxAppVersion: itemForm.value.maxAppVersion || null,
  }
  if (itemTimeRange.value?.length === 2) {
    body.startTime = itemTimeRange.value[0]
    body.endTime = itemTimeRange.value[1]
  } else {
    body.startTime = null
    body.endTime = null
  }

  itemSaving.value = true
  try {
    if (editingItemId.value != null) {
      await updateItem(editingItemId.value, body)
      ElMessage.success('已更新')
    } else {
      await createItem(pageKey.value, slot.id, body)
      ElMessage.success('已添加')
    }
    itemDialogVisible.value = false
    await load()
    const updated = state.value?.slots.find((s) => s.id === slot.id)
    if (updated) activeSlot.value = updated
  } finally {
    itemSaving.value = false
  }
}
</script>

<style scoped>
.app-home-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar-card .toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status .label {
  color: #606266;
  font-size: 13px;
}

.scene-title {
  margin-left: 8px;
  color: #303133;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hint {
  margin-top: 12px;
}

.hint-not-found {
  margin-top: 12px;
}

.hint-not-found :deep(.router-link-active),
.hint-not-found a {
  font-weight: 500;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-actions {
  margin-bottom: 12px;
}

.activity-select {
  width: 100%;
}

.preview-activity {
  font-size: 12px;
  line-height: 1.35;
  word-break: break-all;
}

.preview-activity-id {
  font-family: ui-monospace, monospace;
  color: #606266;
}

.slot-type-code {
  font-family: ui-monospace, monospace;
  color: #606266;
}

.preview-activity-title {
  color: #303133;
  margin-top: 4px;
}
</style>
