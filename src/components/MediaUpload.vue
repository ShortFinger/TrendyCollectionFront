<template>
  <div
    class="media-upload"
    :class="{ 'is-disabled': disabled }"
  >
    <!-- 已上传：预览状态 -->
    <div v-if="hasPreview" class="media-upload__preview">
      <template v-if="isVideo">
        <div class="media-upload__video-wrapper" @click="showVideoPreview = true">
          <video :src="previewValue" class="media-upload__video-thumb" preload="metadata" />
          <div class="media-upload__play-icon">▶</div>
        </div>
      </template>
      <el-image
        v-else
        :src="previewValue"
        :preview-src-list="[previewValue]"
        fit="cover"
        class="media-upload__image"
      />
      <div v-if="!disabled" class="media-upload__actions">
        <el-button
          type="primary"
          :icon="Upload"
          circle
          size="small"
          title="替换"
          @click="triggerFileSelect"
        />
        <el-button
          type="danger"
          :icon="Delete"
          circle
          size="small"
          title="删除"
          @click="handleDelete"
        />
      </div>
    </div>

    <!-- 上传中：进度条 -->
    <div v-else-if="uploading" class="media-upload__uploading">
      <el-progress :percentage="progress" :stroke-width="6" />
      <span class="media-upload__uploading-text">上传中...</span>
    </div>

    <!-- 未上传：占位区域 -->
    <div
      v-else
      class="media-upload__placeholder"
      :class="{ 'is-dragover': isDragover }"
      @click="triggerFileSelect"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
      @drop.prevent="handleDrop"
    >
      <el-icon :size="24"><Upload /></el-icon>
      <span class="media-upload__placeholder-text">点击或拖拽上传</span>
    </div>

    <!-- 隐藏的 file input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="inputAccept"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 视频预览弹窗 -->
    <el-dialog v-model="showVideoPreview" title="视频预览" width="640px" destroy-on-close>
      <video :src="previewValue" controls autoplay style="width: 100%" />
    </el-dialog>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="media-upload__error">{{ errorMsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Upload, Delete } from '@element-plus/icons-vue'
import { uploadFile } from '@/utils/oss'
import { resolveOssObjectToPublicUrl } from '@/utils/ossPreviewUrl'

const props = withDefaults(defineProps<{
  modelValue?: string
  accept?: 'image' | 'video' | 'all'
  dir: string
  maxSize?: number
  disabled?: boolean
}>(), {
  modelValue: '',
  accept: 'image',
  maxSize: 50,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInputRef = ref<HTMLInputElement>()
const uploading = ref(false)
const progress = ref(0)
const errorMsg = ref('')
const isDragover = ref(false)
const showVideoPreview = ref(false)
const uploadedPreviewUrl = ref('')
const uploadedObjectKey = ref('')
const localPreviewUrl = ref('')
/** When v-model is an OSS object key (after load from server), resolve to https for image/video src. */
const resolvedFromKey = ref('')

const IMAGE_EXTS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const VIDEO_EXTS = ['video/mp4', 'video/webm']

const inputAccept = computed(() => {
  if (props.accept === 'image') return 'image/jpeg,image/png,image/webp,image/gif'
  if (props.accept === 'video') return 'video/mp4,video/webm'
  return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm'
})

const isVideo = computed(() => {
  if (!previewValue.value) return false
  const lower = previewValue.value.toLowerCase()
  return lower.endsWith('.mp4') || lower.endsWith('.webm')
})

const previewValue = computed(
  () =>
    localPreviewUrl.value ||
    uploadedPreviewUrl.value ||
    resolvedFromKey.value ||
    props.modelValue ||
    '',
)
const hasPreview = computed(() => !!previewValue.value)

function clearLocalPreviewUrl() {
  if (localPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreviewUrl.value)
  }
  localPreviewUrl.value = ''
}

watch(() => props.modelValue, (val) => {
  if (!val || val !== uploadedObjectKey.value) {
    uploadedPreviewUrl.value = ''
    uploadedObjectKey.value = ''
    clearLocalPreviewUrl()
  }
})

watch(
  () => props.modelValue,
  async (val) => {
    const v = typeof val === 'string' ? val.trim() : ''
    if (!v || /^https?:\/\//i.test(v) || v.startsWith('blob:')) {
      resolvedFromKey.value = ''
      return
    }
    try {
      resolvedFromKey.value = await resolveOssObjectToPublicUrl(v)
    } catch {
      resolvedFromKey.value = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearLocalPreviewUrl()
})

function triggerFileSelect() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function validateFile(file: File): string | null {
  const allowedTypes =
    props.accept === 'image' ? IMAGE_EXTS :
    props.accept === 'video' ? VIDEO_EXTS :
    [...IMAGE_EXTS, ...VIDEO_EXTS]

  if (!allowedTypes.includes(file.type)) {
    return `不支持的文件类型: ${file.type}`
  }
  if (file.size > props.maxSize * 1024 * 1024) {
    return `文件大小超过限制（最大 ${props.maxSize}MB），当前: ${(file.size / 1024 / 1024).toFixed(1)}MB`
  }
  return null
}

async function doUpload(file: File) {
  const err = validateFile(file)
  if (err) {
    errorMsg.value = err
    return
  }

  errorMsg.value = ''
  uploading.value = true
  progress.value = 0
  clearLocalPreviewUrl()
  localPreviewUrl.value = URL.createObjectURL(file)

  try {
    const result = await uploadFile(file, props.dir, (p) => {
      progress.value = p
    })
    uploadedObjectKey.value = result.objectKey
    try {
      const signed = await resolveOssObjectToPublicUrl(result.objectKey)
      uploadedPreviewUrl.value = signed || result.url
    } catch {
      uploadedPreviewUrl.value = result.url
    }
    emit('update:modelValue', result.objectKey)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : '上传失败'
    clearLocalPreviewUrl()
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) doUpload(file)
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const file = e.dataTransfer?.files[0]
  if (file) doUpload(file)
}

function handleDelete() {
  clearLocalPreviewUrl()
  uploadedPreviewUrl.value = ''
  uploadedObjectKey.value = ''
  emit('update:modelValue', '')
  errorMsg.value = ''
}
</script>

<style scoped>
.media-upload {
  width: 120px;
  height: 120px;
  position: relative;
}

.media-upload__placeholder {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  gap: 4px;
  color: #8c8c8c;
}

.media-upload__placeholder:hover,
.media-upload__placeholder.is-dragover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.media-upload__placeholder-text {
  font-size: 12px;
}

.media-upload__preview {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
}

.media-upload__preview:hover .media-upload__actions {
  opacity: 1;
}

.media-upload__image {
  width: 100%;
  height: 100%;
}

.media-upload__video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  background: #000;
}

.media-upload__video-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-upload__play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-upload__actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.media-upload__uploading {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 8px;
}

.media-upload__uploading-text {
  font-size: 12px;
  color: #8c8c8c;
}

.media-upload__error {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: var(--el-color-danger);
  white-space: nowrap;
}

.is-disabled .media-upload__placeholder {
  cursor: not-allowed;
  background: #f5f5f5;
}
</style>
