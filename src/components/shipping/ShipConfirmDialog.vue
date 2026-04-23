<template>
  <el-dialog
    :model-value="modelValue"
    title="确认发货"
    width="460px"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="物流公司" prop="expressCompany">
        <el-input v-model="form.expressCompany" placeholder="请输入物流公司" maxlength="64" />
      </el-form-item>
      <el-form-item label="运单号" prop="trackingNo">
        <el-input v-model="form.trackingNo" placeholder="请输入运单号" maxlength="64" />
      </el-form-item>
      <el-form-item label="发货备注" prop="shipRemark">
        <el-input
          v-model="form.shipRemark"
          type="textarea"
          :rows="3"
          maxlength="255"
          show-word-limit
          placeholder="可选，最多 255 字"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认发货</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { confirmCabinetShipOrder } from '@/api/cabinetShip'
import type { CabinetShipConfirmRequest } from '@/types/cabinetShip'

const props = defineProps<{
  modelValue: boolean
  shipOrderId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive<CabinetShipConfirmRequest>({
  expressCompany: '',
  trackingNo: '',
  shipRemark: '',
})

const rules: FormRules = {
  expressCompany: [{ required: true, message: '请输入物流公司', trigger: 'blur' }],
  trackingNo: [{ required: true, message: '请输入运单号', trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.expressCompany = ''
      form.trackingNo = ''
      form.shipRemark = ''
      formRef.value?.clearValidate()
    }
  },
)

function onClose() {
  emit('update:modelValue', false)
}

async function onSubmit() {
  if (!props.shipOrderId) {
    ElMessage.error('缺少发货申请单 ID')
    return
  }
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  submitting.value = true
  try {
    await confirmCabinetShipOrder(props.shipOrderId, form)
    ElMessage.success('发货成功')
    emit('success')
    onClose()
  } finally {
    submitting.value = false
  }
}
</script>
