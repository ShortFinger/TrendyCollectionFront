<template>
  <el-drawer
    :model-value="visible"
    :title="title || 'Payload 预览'"
    size="560px"
    @closed="onClosed"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div class="payload-preview-drawer">
      <div v-if="metaTags.length" class="meta-row">
        <span class="meta-label">Meta</span>
        <el-tag
          v-for="item in metaTags"
          :key="item.key"
          size="small"
          :type="item.type"
          effect="light"
        >
          {{ item.label }}: {{ item.value }}
        </el-tag>
      </div>

      <div class="ops-row">
        <el-button size="small" @click="expandAll">Expand all</el-button>
        <el-button size="small" @click="collapseAll">Collapse all</el-button>
        <el-button size="small" type="primary" plain @click="copyPayload">Copy payload</el-button>
      </div>

      <el-alert
        v-if="parseState.kind === 'empty'"
        type="info"
        :closable="false"
        show-icon
        title="Payload is empty."
      />

      <template v-else-if="parseState.kind === 'invalid'">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="JSON 格式非法，当前展示原始 payload 文本。"
        />
        <pre class="raw-pre">{{ parseState.rawText }}</pre>
      </template>

      <template v-else-if="parseState.kind === 'ok'">
        <el-tree
          :key="treeRenderKey"
          class="payload-tree"
          node-key="key"
          :data="treeData"
          :props="treeProps"
          :default-expanded-keys="defaultExpandedKeys"
          :default-expand-all="expandAllFlag"
          :expand-on-click-node="false"
        />
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

type DrawerMode = 'json' | 'render'
type MetaInput =
  | Record<string, unknown>
  | Array<{ key?: string; label?: string; value: unknown; type?: '' | 'success' | 'warning' | 'info' | 'danger' }>

interface TreeNode {
  key: string
  label: string
  children?: TreeNode[]
}
type KeySegment = string | number

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    meta?: MetaInput
    payloadRaw: unknown
    defaultExpandDepth?: number
    mode?: DrawerMode
  }>(),
  {
    defaultExpandDepth: 2,
    mode: 'json',
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const treeRenderKey = ref(0)
const expandAllFlag = ref(false)

const treeProps = {
  label: 'label',
  children: 'children',
}

const metaTags = computed(() => {
  const raw = props.meta
  if (!raw) return [] as Array<{ key: string; label: string; value: string; type: '' | 'success' | 'warning' | 'info' | 'danger' }>

  if (Array.isArray(raw)) {
    return raw.map((item, index) => ({
      key: item.key || item.label || String(index),
      label: item.label || item.key || `meta_${index}`,
      value: stringifyLeaf(item.value),
      type: item.type || 'info',
    }))
  }

  return Object.entries(raw).map(([k, v]) => ({
    key: k,
    label: k,
    value: stringifyLeaf(v),
    type: 'info' as const,
  }))
})

const parseState = ref<
  | { kind: 'empty' }
  | { kind: 'invalid'; rawText: string }
  | { kind: 'ok'; parsed: unknown; sourceText: string }
>({ kind: 'empty' })

const treeData = ref<TreeNode[]>([])

const defaultExpandedKeys = computed<string[]>(() => {
  if (parseState.value.kind !== 'ok') return []
  if (expandAllFlag.value) return []
  return collectExpandedKeys(treeData.value, Math.max(0, props.defaultExpandDepth))
})

function rebuildState() {
  const raw = props.payloadRaw
  if (raw == null) {
    parseState.value = { kind: 'empty' }
    treeData.value = []
    return
  }

  if (typeof raw === 'string') {
    const sourceText = raw
    const text = raw.trim()
    if (!text) {
      parseState.value = { kind: 'empty' }
      treeData.value = []
      return
    }
    try {
      const parsed = JSON.parse(text)
      parseState.value = { kind: 'ok', parsed, sourceText }
      treeData.value = [buildTreeNode('$', parsed, ['$'])]
      return
    } catch {
      parseState.value = { kind: 'invalid', rawText: raw }
      treeData.value = []
      return
    }
  }

  if (typeof raw === 'object') {
    parseState.value = { kind: 'ok', parsed: raw, sourceText: safeStringify(raw) }
    treeData.value = [buildTreeNode('$', raw, ['$'])]
    return
  }

  parseState.value = { kind: 'ok', parsed: raw, sourceText: String(raw) }
  treeData.value = [buildTreeNode('$', raw, ['$'])]
}

watch(
  () => [props.visible, props.defaultExpandDepth, props.mode],
  () => {
    rebuildState()
    expandAllFlag.value = false
    treeRenderKey.value += 1
  },
  { immediate: true },
)
watch(
  () => props.payloadRaw,
  () => {
    rebuildState()
    expandAllFlag.value = false
    treeRenderKey.value += 1
  },
  { deep: true },
)

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Object.prototype.toString.call(v) === '[object Object]'
}

function stringifyLeaf(v: unknown): string {
  if (v === undefined) return 'undefined'
  if (v === null) return 'null'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return safeStringify(v)
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

function encodeNodeKey(segments: KeySegment[]): string {
  return JSON.stringify(segments)
}

function buildTreeNode(name: string, value: unknown, segments: KeySegment[]): TreeNode {
  const key = encodeNodeKey(segments)
  if (Array.isArray(value)) {
    const children = value.map((item, index) => buildTreeNode(`[${index}]`, item, [...segments, index]))
    return { key, label: `${name}: Array(${value.length})`, children }
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
    const children = entries.map(([k, v]) => buildTreeNode(k, v, [...segments, k]))
    return { key, label: `${name}: Object{${entries.length}}`, children }
  }

  const t = value === null ? 'null' : typeof value
  return { key, label: `${name}: ${t} = ${stringifyLeaf(value)}` }
}

function collectExpandedKeys(nodes: TreeNode[], depth: number): string[] {
  if (depth <= 0) return []
  const keys: string[] = []
  const walk = (items: TreeNode[], level: number) => {
    if (level > depth) return
    for (const node of items) {
      keys.push(node.key)
      if (node.children?.length) walk(node.children, level + 1)
    }
  }
  walk(nodes, 1)
  return keys
}

function expandAll() {
  expandAllFlag.value = true
  treeRenderKey.value += 1
}

function collapseAll() {
  expandAllFlag.value = false
  treeRenderKey.value += 1
}

function onClosed() {
  parseState.value = { kind: 'empty' }
  treeData.value = []
  expandAllFlag.value = false
  treeRenderKey.value += 1
}

async function copyPayload() {
  let text = ''
  if (parseState.value.kind === 'empty') text = ''
  else if (parseState.value.kind === 'invalid') text = parseState.value.rawText
  else text = props.mode === 'render' ? safeStringify(parseState.value.parsed) : parseState.value.sourceText

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制 payload')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.payload-preview-drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-label {
  color: #606266;
  font-size: 12px;
}

.ops-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.raw-pre {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.payload-tree :deep(.el-tree-node__label) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}
</style>
