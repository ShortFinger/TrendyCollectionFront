<template>
  <el-dialog
    :model-value="modelValue"
    title="从图库选择"
    width="900px"
    destroy-on-close
    @update:model-value="(v: boolean) => emit('update:modelValue', v)"
  >
    <el-form :inline="true" class="picker-filter">
      <el-form-item label="标签">
        <el-select
          v-model="tagId"
          clearable
          placeholder="全部"
          style="width: 200px"
          @change="onFilterChange"
        >
          <el-option v-for="t in tagOptions" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="文件名">
        <el-input v-model="keyword" clearable placeholder="关键词" style="width: 200px" @keyup.enter="reload" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="reload">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="rows"
      stripe
      highlight-current-row
      style="width: 100%"
      @current-change="(row: MediaAssetVO | undefined) => (selected = row ?? null)"
    >
      <el-table-column label="预览" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.previewUrl"
            :src="row.previewUrl"
            fit="cover"
            style="width: 56px; height: 56px; border-radius: 4px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="originalFilename" label="文件名" min-width="160" show-overflow-tooltip />
      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <el-tag v-for="t in row.tags" :key="t.id" size="small" style="margin-right: 4px">{{ t.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      style="margin-top: 12px; justify-content: flex-end"
      @current-change="load"
      @size-change="load"
    />

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :disabled="!selected" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { fetchMediaAssets, fetchMediaTags } from '@/api/mediaGallery'
import type { MediaAssetVO, MediaTagVO } from '@/types/mediaGallery'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  select: [payload: { objectKey: string; previewUrl: string }]
}>()

const loading = ref(false)
const rows = ref<MediaAssetVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const tagId = ref<string | undefined>(undefined)
const keyword = ref('')
const tagOptions = ref<MediaTagVO[]>([])
const selected = ref<MediaAssetVO | null>(null)

async function loadTags() {
  const { data } = await fetchMediaTags()
  tagOptions.value = data ?? []
}

async function load() {
  loading.value = true
  try {
    const { data } = await fetchMediaAssets({
      page: page.value,
      size: size.value,
      tagId: tagId.value,
      keyword: keyword.value?.trim() || undefined,
      sort: 'create_time_desc',
    })
    rows.value = data?.records ?? []
    total.value = data?.total ?? 0
  } finally {
    loading.value = false
  }
}

function reload() {
  page.value = 1
  return load()
}

function onFilterChange() {
  reload()
}

function confirm() {
  if (!selected.value) return
  emit('select', { objectKey: selected.value.objectKey, previewUrl: selected.value.previewUrl })
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selected.value = null
      loadTags()
      load()
    }
  },
)

onMounted(() => {
  if (props.modelValue) {
    loadTags()
    load()
  }
})
</script>

<style scoped>
.picker-filter {
  margin-bottom: 8px;
}
</style>
