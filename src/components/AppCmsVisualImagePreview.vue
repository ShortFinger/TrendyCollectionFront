<template>
  <el-image
    v-if="src"
    :src="src"
    style="width: 48px; height: 48px"
    fit="cover"
    :preview-src-list="[src]"
  />
  <span v-else class="preview-muted">{{ status }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { resolveOssObjectToPublicUrl } from '@/utils/ossPreviewUrl'

const props = defineProps<{
  imageRef: string
}>()

const src = ref('')
const status = ref('')

watch(
  () => props.imageRef,
  async (ref) => {
    const r = ref?.trim() ?? ''
    if (!r) {
      src.value = ''
      status.value = ''
      return
    }
    status.value = '加载中…'
    try {
      src.value = await resolveOssObjectToPublicUrl(r)
      status.value = src.value ? '' : '无法解析'
    } catch {
      src.value = ''
      status.value = '加载失败'
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.preview-muted {
  font-size: 12px;
  color: #909399;
}
</style>
