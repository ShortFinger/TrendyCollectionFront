<template>
  <div class="page media-gallery-page">
    <el-card>
      <template #header>
        <span>素材库</span>
        <div class="header-actions">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style="display: none"
            @change="onFileChange"
          />
          <el-button type="primary" :loading="uploading" @click="triggerUpload">上传图片</el-button>
        </div>
      </template>

      <el-form :inline="true" class="filter-form">
        <el-form-item label="标签">
          <el-select v-model="tagId" clearable placeholder="全部" style="width: 200px" @change="reload">
            <el-option v-for="t in tagOptions" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input v-model="keyword" clearable placeholder="关键词" style="width: 200px" @keyup.enter="reload" />
        </el-form-item>
        <el-form-item label="上传标签">
          <el-input
            v-model="pendingTagInput"
            clearable
            placeholder="可选，逗号分隔，登记时使用"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="reload">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="rows" stripe style="width: 100%">
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
        <el-table-column prop="originalFilename" label="文件名" min-width="180" show-overflow-tooltip />
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="t in row.tags" :key="t.id" size="small" style="margin-right: 4px">{{ t.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="load"
        @size-change="load"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadFile } from '@/utils/oss'
import { deleteMediaAsset, fetchMediaAssets, fetchMediaTags, registerMediaAsset } from '@/api/mediaGallery'
import type { MediaAssetVO, MediaTagVO } from '@/types/mediaGallery'

const loading = ref(false)
const uploading = ref(false)
const rows = ref<MediaAssetVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const tagId = ref<string | undefined>(undefined)
const keyword = ref('')
const tagOptions = ref<MediaTagVO[]>([])
const pendingTagInput = ref('')
const fileInputRef = ref<HTMLInputElement>()

function parseTagNames(raw: string): string[] | undefined {
  const s = raw.trim()
  if (!s) return undefined
  const parts = s
    .split(/[,，]/)
    .map((x) => x.trim())
    .filter(Boolean)
  return parts.length ? parts : undefined
}

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

function triggerUpload() {
  fileInputRef.value?.click()
}

function readImageSize(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({})
    }
    img.src = url
  })
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const { objectKey } = await uploadFile(file, 'media-library')
    const dim = await readImageSize(file)
    await registerMediaAsset({
      objectKey,
      originalFilename: file.name,
      byteSize: file.size,
      contentType: file.type,
      width: dim.width,
      height: dim.height,
      tagNames: parseTagNames(pendingTagInput.value),
    })
    ElMessage.success('已登记素材')
    await reload()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '上传或登记失败'
    ElMessage.error(msg)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function onDelete(row: MediaAssetVO) {
  await ElMessageBox.confirm(`确定删除「${row.originalFilename}」？`, '删除素材', { type: 'warning' })
  await deleteMediaAsset(row.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(async () => {
  await loadTags()
  await load()
})
</script>

<style scoped>
.media-gallery-page .header-actions {
  float: right;
}
.filter-form {
  margin-bottom: 8px;
}
</style>
