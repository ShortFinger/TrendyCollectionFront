<template>
  <div class="coupon-form-page">
    <el-card shadow="never">
      <template #header>
        <span>{{ isEdit ? '编辑优惠券' : '新建优惠券' }}</span>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px"
        v-loading="pageLoading"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入券名称" clearable />
        </el-form-item>
        <el-form-item label="券类型" prop="couponType">
          <el-radio-group v-model="form.couponType">
            <el-radio value="CASH">现金券</el-radio>
            <el-radio value="DISCOUNT">折扣券</el-radio>
            <el-radio value="FREE_SHIPPING">包邮券</el-radio>
            <el-radio value="EXCHANGE">兑换券</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 优惠规则 -->
        <el-divider content-position="left">优惠规则</el-divider>
        <el-form-item v-if="form.couponType === 'CASH'" label="减免金额(元)" prop="discountYuan">
          <el-input-number v-model="form.discountYuan" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item v-if="form.couponType === 'DISCOUNT'" label="折扣比例" prop="discountValue">
          <el-input-number v-model="form.discountValue" :min="1" :max="99" :step="1" />
          <span style="margin-left: 8px; color: #999">如 80 = 8折</span>
        </el-form-item>
        <el-form-item v-if="form.couponType === 'DISCOUNT'" label="最高减免(元)" prop="discountCapYuan">
          <el-input-number v-model="form.discountCapYuan" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item v-if="form.couponType === 'EXCHANGE'" label="关联商品ID" prop="exchangeProductId">
          <el-input-number v-model="form.exchangeProductId" :min="1" :controls="false" />
        </el-form-item>
        <el-form-item v-if="form.couponType !== 'EXCHANGE'" label="最低消费(元)" prop="minSpendYuan">
          <el-input-number v-model="form.minSpendYuan" :min="0" :precision="2" :step="1" />
          <span style="margin-left: 8px; color: #999">0 = 无门槛</span>
        </el-form-item>
        <el-form-item label="使用范围" prop="scopeType">
          <el-radio-group v-model="form.scopeType">
            <el-radio value="ALL">全场通用</el-radio>
            <el-radio value="ACTIVITY">指定活动</el-radio>
            <el-radio value="PRODUCT">指定商品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.scopeType === 'ACTIVITY' || form.scopeType === 'PRODUCT'" label="范围ID" prop="scopeIds">
          <el-input v-model="form.scopeIds" placeholder='JSON 数组，如 [1,2,3]' clearable />
        </el-form-item>

        <!-- 有效期 -->
        <el-divider content-position="left">有效期</el-divider>
        <el-form-item label="有效期类型" prop="validityType">
          <el-radio-group v-model="form.validityType">
            <el-radio value="FIXED">固定日期</el-radio>
            <el-radio value="DYNAMIC">领取后N天</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.validityType === 'FIXED'" label="有效时间" prop="validRange">
          <el-date-picker
            v-model="form.validRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="form.validityType === 'DYNAMIC'" label="有效天数" prop="validDays">
          <el-input-number v-model="form.validDays" :min="1" :step="1" />
        </el-form-item>

        <!-- 发放设置 -->
        <el-divider content-position="left">发放设置</el-divider>
        <el-form-item label="总发行量" prop="totalCount">
          <el-input-number v-model="form.totalCount" :min="-1" :step="1" />
          <span style="margin-left: 8px; color: #999">-1 = 不限量</span>
        </el-form-item>
        <el-form-item label="每人限领" prop="perUserLimit">
          <el-input-number v-model="form.perUserLimit" :min="1" :step="1" />
        </el-form-item>

        <!-- 跳转设置 -->
        <el-divider content-position="left">跳转设置（去使用）</el-divider>
        <el-form-item label="跳转方式">
          <el-radio-group v-model="form.navigateType">
            <el-radio value="PRESET">预设页面</el-radio>
            <el-radio value="CUSTOM">自定义路径</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.navigateType === 'PRESET'" label="目标页面">
          <el-select v-model="form.navigatePreset" placeholder="请选择" style="width: 200px">
            <el-option label="首页" value="HOME" />
            <el-option label="指定活动页" value="ACTIVITY" />
            <el-option label="指定商品页" value="PRODUCT" />
            <el-option label="商品分类页" value="CATEGORY" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.navigateType === 'CUSTOM'" label="自定义路径">
          <el-input v-model="form.navigateUrl" placeholder="如 /pages/activity/detail" clearable />
        </el-form-item>
        <el-form-item v-if="form.navigateType" label="跳转参数">
          <el-input v-model="form.navigateParams" placeholder='JSON，如 {"id":"123"}' clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getCouponTemplate, createCouponTemplate, updateCouponTemplate } from '@/api/coupon'
import type { CouponTemplateSaveRequest } from '@/types/coupon'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const pageLoading = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  couponType: 'CASH' as string,
  scopeType: 'ALL' as string,
  scopeIds: '',
  discountYuan: 0,
  discountValue: 0,
  discountCapYuan: 0,
  minSpendYuan: 0,
  exchangeProductId: undefined as number | undefined,
  exchangeCode: '',
  validityType: 'FIXED' as string,
  validRange: null as [string, string] | null,
  validDays: 7,
  totalCount: -1,
  perUserLimit: 1,
  navigateType: '' as string,
  navigatePreset: '' as string,
  navigateUrl: '',
  navigateParams: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入券名称', trigger: 'blur' }],
  couponType: [{ required: true, message: '请选择券类型', trigger: 'change' }],
  scopeType: [{ required: true, message: '请选择使用范围', trigger: 'change' }],
  validityType: [{ required: true, message: '请选择有效期类型', trigger: 'change' }],
  validRange: [{ required: true, message: '请选择有效时间', trigger: 'change' }],
  validDays: [{ required: true, message: '请输入有效天数', trigger: 'blur' }],
  totalCount: [{ required: true, message: '请输入总发行量', trigger: 'blur' }],
}

function buildPayload(): CouponTemplateSaveRequest {
  const payload: CouponTemplateSaveRequest = {
    name: form.name,
    couponType: form.couponType,
    scopeType: form.scopeType,
    validityType: form.validityType,
    totalCount: form.totalCount,
    perUserLimit: form.perUserLimit,
  }

  if (form.scopeType !== 'ALL' && form.scopeIds) {
    payload.scopeIds = form.scopeIds
  }

  switch (form.couponType) {
    case 'CASH':
      payload.discountValue = Math.round(form.discountYuan * 100)
      payload.minSpend = Math.round(form.minSpendYuan * 100)
      break
    case 'DISCOUNT':
      payload.discountValue = form.discountValue
      payload.discountCap = Math.round(form.discountCapYuan * 100)
      payload.minSpend = Math.round(form.minSpendYuan * 100)
      break
    case 'FREE_SHIPPING':
      payload.minSpend = Math.round(form.minSpendYuan * 100)
      break
    case 'EXCHANGE':
      payload.exchangeProductId = form.exchangeProductId
      break
  }

  if (form.validityType === 'FIXED' && form.validRange) {
    payload.validStart = form.validRange[0]
    payload.validEnd = form.validRange[1]
  } else if (form.validityType === 'DYNAMIC') {
    payload.validDays = form.validDays
  }

  if (form.navigateType) {
    payload.navigateType = form.navigateType
    if (form.navigateType === 'PRESET') {
      payload.navigatePreset = form.navigatePreset
    } else {
      payload.navigateUrl = form.navigateUrl
    }
    if (form.navigateParams) {
      payload.navigateParams = form.navigateParams
    }
  }

  return payload
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await updateCouponTemplate(Number(route.params.id), payload)
      ElMessage.success('保存成功')
    } else {
      await createCouponTemplate(payload)
      ElMessage.success('创建成功')
    }
    router.push('/coupon')
  } finally {
    submitting.value = false
  }
}

async function loadTemplate() {
  const id = Number(route.params.id)
  if (!id) return
  pageLoading.value = true
  try {
    const { data } = await getCouponTemplate(id)
    form.name = data.name
    form.couponType = data.couponType
    form.scopeType = data.scopeType
    form.scopeIds = data.scopeIds || ''
    form.validityType = data.validityType
    form.totalCount = data.totalCount
    form.perUserLimit = data.perUserLimit

    switch (data.couponType) {
      case 'CASH':
        form.discountYuan = (data.discountValue || 0) / 100
        form.minSpendYuan = (data.minSpend || 0) / 100
        break
      case 'DISCOUNT':
        form.discountValue = data.discountValue || 0
        form.discountCapYuan = (data.discountCap || 0) / 100
        form.minSpendYuan = (data.minSpend || 0) / 100
        break
      case 'FREE_SHIPPING':
        form.minSpendYuan = (data.minSpend || 0) / 100
        break
      case 'EXCHANGE':
        form.exchangeProductId = data.exchangeProductId
        break
    }

    if (data.validityType === 'FIXED') {
      form.validRange = data.validStart && data.validEnd ? [data.validStart, data.validEnd] : null
    } else {
      form.validDays = data.validDays || 7
    }

    form.navigateType = data.navigateType || ''
    form.navigatePreset = data.navigatePreset || ''
    form.navigateUrl = data.navigateUrl || ''
    form.navigateParams = data.navigateParams || ''
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) loadTemplate()
})
</script>

<style scoped>
.coupon-form-page {
  max-width: 800px;
}
</style>
