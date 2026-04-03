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
        <el-table-column prop="sortOrder" label="sortOrder" width="100" />
        <el-table-column label="内容项数" width="100" align="center">
          <template #default="{ row }">
            {{ row.items?.length ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" @click="openItemsDrawer(row)">内容项</el-button>
            <el-button link :disabled="$index === 0" @click="moveSlot($index, -1)">上移</el-button>
            <el-button link :disabled="$index === sortedSlots.length - 1" @click="moveSlot($index, 1)">
              下移
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="slotDialogVisible" title="添加槽位" width="420px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="类型">
          <el-select v-model="newSlotType" style="width: 100%">
            <el-option label="轮播行（banner_row）" value="banner_row" />
            <el-option label="图标宫格（icon_grid）" value="icon_grid" />
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
        <el-table-column label="预览" width="72">
          <template #default="{ row }">
            <el-image v-if="parsePayload(row.payload).imageUrl" :src="parsePayload(row.payload).imageUrl"
              style="width: 48px; height: 48px" fit="cover" />
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

    <el-dialog v-model="itemDialogVisible" :title="editingItemId ? '编辑内容项' : '添加内容项'" width="560px" destroy-on-close
      @closed="resetItemForm">
      <el-form :model="itemForm" label-width="110px">
        <el-form-item label="图片">
          <div class="img-row">
            <el-input v-model="visualForm.imageUrl" placeholder="图片 URL" />
            <el-upload :show-file-list="false" :http-request="handleImageUpload">
              <el-button type="primary" plain>上传</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="链接">
          <el-input v-model="visualForm.linkUrl" placeholder="可选，小程序 path 或 H5" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="visualForm.title" placeholder="可选" />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="itemForm.channel" style="width: 100%">
            <el-option label="全部" value="all" />
            <el-option label="微信小程序" value="mp-weixin" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="itemTimeRange" type="datetimerange" range-separator="至" start-placeholder="开始"
            end-placeholder="结束" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
import { ElMessage, ElMessageBox, type UploadRequestOptions } from 'element-plus'
import {
  fetchEditorState,
  forkDraft,
  publishPage,
  createSlot,
  updateSlot,
  createItem,
  updateItem,
} from '@/api/appCms'
import { uploadImage } from '@/api/upload'
import type { EditorSlotRow, EditorItemRow, EditorStateResponse } from '@/types/appCms'
import {
  CONTENT_TYPE_BY_SLOT,
  SLOT_TYPE_LABEL,
  buildPayload,
  parsePayload,
  validateVisualPayload,
  isSlotType,
  defaultPayload,
  type VisualPayload,
} from '@/utils/appCmsPayload'

const route = useRoute()
const pageKey = computed(() => {
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

const slotDialogVisible = ref(false)
const newSlotType = ref<'banner_row' | 'icon_grid'>('banner_row')
const slotSaving = ref(false)

const drawerVisible = ref(false)
const activeSlot = ref<EditorSlotRow | null>(null)

const itemDialogVisible = ref(false)
const itemSaving = ref(false)
const editingItemId = ref<number | null>(null)
const visualForm = ref<VisualPayload>(defaultPayload())
const itemTimeRange = ref<[string, string] | null>(null)
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
  if (isSlotType(type)) return SLOT_TYPE_LABEL[type]
  return type
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
  newSlotType.value = 'banner_row'
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
  if (item) {
    visualForm.value = parsePayload(item.payload)
    itemForm.value.sortOrder = item.sortOrder ?? 0
    itemForm.value.channel = item.channel?.trim() ? item.channel : 'all'
    itemForm.value.minAppVersion = item.minAppVersion ?? ''
    itemForm.value.maxAppVersion = item.maxAppVersion ?? ''
    if (item.startTime && item.endTime) {
      itemTimeRange.value = [item.startTime, item.endTime]
    } else {
      itemTimeRange.value = null
    }
  } else {
    visualForm.value = defaultPayload()
    itemForm.value = {
      sortOrder: (activeSlot.value?.items?.length ?? 0),
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
  itemTimeRange.value = null
}

async function handleImageUpload(options: UploadRequestOptions) {
  const fileOptions = options
  const raw = fileOptions.file as File
  try {
    const res = await uploadImage(raw)
    visualForm.value.imageUrl = res.data.url
    ElMessage.success('上传成功')
    fileOptions.onSuccess(res)
  } catch (e: unknown) {
    fileOptions.onError(e as any)
  }
}

async function submitItem() {
  const slot = activeSlot.value
  if (!slot) {
    ElMessage.warning('请先选择槽位')
    return
  }
  const err = validateVisualPayload(visualForm.value)
  if (err) {
    ElMessage.error(err)
    return
  }
  if (!isSlotType(slot.slotType)) {
    ElMessage.error('不支持的槽位类型')
    return
  }
  const contentType = CONTENT_TYPE_BY_SLOT[slot.slotType]
  const body: Record<string, unknown> = {
    sortOrder: itemForm.value.sortOrder,
    contentType,
    payload: buildPayload(visualForm.value),
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

.img-row {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.img-row .el-input {
  flex: 1;
}
</style>
