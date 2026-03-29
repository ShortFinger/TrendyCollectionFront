<template>
  <div class="page boxes-page">
    <el-page-header @back="router.back()" title="返回赏池列表" :content="activity?.title ?? '编辑箱子'" style="margin-bottom: 20px" />

    <el-card style="margin-bottom: 20px" v-loading="actLoading">
      <template #header><span>赏池信息</span></template>
      <template v-if="activity">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="赏池名称">{{ activity.title }}</el-descriptions-item>
          <el-descriptions-item label="活动 ID">{{ activity.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="activity.status === 1 ? 'success' : 'info'">{{ activity.status === 1 ? '上架' : '下架' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="单抽价(¥)">¥{{ activity.moneyPrice }}</el-descriptions-item>
          <el-descriptions-item label="积分价">{{ activity.scorePrice }}</el-descriptions-item>
          <el-descriptions-item label="最大箱子数">{{ activity.boxCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="连开优惠">{{ activity.multiBuyDiscount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="每用户限次">{{ activity.perUserLimit }}</el-descriptions-item>
          <el-descriptions-item label="销量">{{ activity.sales }}</el-descriptions-item>
          <el-descriptions-item label="参与用户">{{ activity.joinUserTotal }}</el-descriptions-item>
          <el-descriptions-item label="方图">
            <el-image v-if="activity.squareThumb" :src="activity.squareThumb" style="width: 60px; height: 60px" fit="cover" :preview-src-list="[activity.squareThumb]" />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ activity.createTime }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>

    <el-card>
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span>箱子列表</span>
          <el-button type="primary" @click="handleAdd" :disabled="boxLimitReached">
            新增箱子
            <span v-if="activity && activity.boxCount" style="margin-left: 4px; font-weight: normal">
              （{{ list.length }}/{{ activity.boxCount }}）
            </span>
          </el-button>
        </div>
      </template>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="boxNumber" label="箱子编号" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="boxStatusTag(row.boxStatus).type" size="small">{{ boxStatusTag(row.boxStatus).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="boxSkuCount" label="SKU 种类" width="100" />
        <el-table-column prop="boxItemCount" label="商品总数" width="100" />
        <el-table-column prop="boxItemLeft" label="剩余数量" width="100" />
        <el-table-column label="抽取进度" min-width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="row.boxItemCount > 0 ? Math.round(((row.boxItemCount - row.boxItemLeft) / row.boxItemCount) * 100) : 0"
              :stroke-width="14"
              :text-inside="true"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除该箱子？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="fetchBoxes"
        @size-change="fetchBoxes"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑箱子' : '新增箱子'" width="920px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-divider content-position="left">箱子设置</el-divider>
        <el-form-item label="箱子编号">
          <el-input :model-value="String(isEdit ? displayBoxNumber : nextBoxNumberPreview)" disabled style="width: 100%" />
          <span v-if="!isEdit" class="box-number-hint">保存时自动分配为当前最大编号 +1（从 1 开始）</span>
        </el-form-item>
        <el-form-item label="箱子状态" prop="boxStatus">
          <el-select v-model="form.boxStatus" style="width: 100%">
            <el-option label="未开启" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已结束" :value="2" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">箱内商品</el-divider>
        <p class="box-prize-hint">
          箱内商品规则：每添加一条对应 <code>activity_box_item</code> 一行；开奖概率与特殊开奖概率固定为 100%，库存（签数）固定为 1。<strong>未绑定</strong>的 SKU 可直接挂入；任意活动内 SKU 可<strong>复制</strong>为新 SKU 后挂箱（源 SKU 不变）。
        </p>

        <template v-if="isEdit">
          <div class="box-prize-toolbar">
            <el-button type="primary" plain size="small" @click="openSkuPicker('edit')">从已有 SKU 选择</el-button>
            <el-button type="primary" size="small" @click="openPrizeDialogForNewSku">新建箱内商品</el-button>
          </div>
          <el-table :data="boxSkus" stripe size="small" v-loading="boxSkusLoading" max-height="280">
            <el-table-column prop="skuCode" label="SKU 编码" width="130" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column label="签数" width="72">
              <template #default="{ row }">{{ row.stockQuantity }}</template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openPrizeDialogEditSku(row)">编辑</el-button>
                <el-popconfirm title="确定删除？将移除对应箱内签位（无抽中记录时）。" @confirm="handleDeleteBoxSku(row.id)">
                  <template #reference>
                    <el-button link type="danger" size="small">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template v-else>
          <div class="box-prize-toolbar">
            <el-button type="primary" plain size="small" @click="openSkuPicker('draft')">从已有 SKU 选择</el-button>
            <el-button type="primary" size="small" @click="openPrizeDialogForDraft">新建箱内商品</el-button>
          </div>
          <el-table v-if="draftPrizes.length" :data="draftPrizes" stripe size="small" max-height="200" style="margin-bottom: 12px">
            <el-table-column label="类型" width="88">
              <template #default><el-tag size="small" type="primary">新建</el-tag></template>
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="draftPrizes.splice($index, 1)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table v-if="draftLinkedSkus.length" :data="draftLinkedSkus" stripe size="small" max-height="200" style="margin-bottom: 12px">
            <el-table-column label="类型" width="88">
              <template #default><el-tag size="small" type="success">直接挂入</el-tag></template>
            </el-table-column>
            <el-table-column prop="skuCode" label="SKU 编码" width="130" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="draftLinkedSkus.splice($index, 1)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table v-if="draftCopiedSkus.length" :data="draftCopiedSkus" stripe size="small" max-height="200" style="margin-bottom: 12px">
            <el-table-column label="类型" width="88">
              <template #default><el-tag size="small" type="warning">复制挂箱</el-tag></template>
            </el-table-column>
            <el-table-column prop="sourceSkuCode" label="来源 SKU" width="130" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="draftCopiedSkus.splice($index, 1)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!draftPrizes.length && !draftLinkedSkus.length && !draftCopiedSkus.length" description="可新建、直接挂入或复制 SKU，保存箱子时一并写入" :image-size="64" />
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="prizeDialogVisible" :title="prizeDialogTitle" width="720px" :close-on-click-modal="false" append-to-body>
      <el-form ref="prizeFormRef" :model="prizeForm" :rules="prizeFormRules" label-width="130px">
        <el-form-item v-if="prizeSkuEditId" label="SKU 编码">
          <el-input :model-value="prizeForm.skuCode" disabled />
        </el-form-item>
        <el-form-item label="奖品名称" prop="name">
          <el-input v-model="prizeForm.name" placeholder="SKU 显示名称" />
        </el-form-item>
        <el-form-item label="关联商品" prop="selectedProductIds">
          <div style="width: 100%">
            <el-button @click="openProductPicker">选择商品</el-button>
            <span style="margin-left: 8px; color: var(--el-text-color-secondary); font-size: 13px">
              已选 {{ prizeForm.selectedProductIds.length }} 件
            </span>
            <div v-if="selectedProductsForPrize.length" style="margin-top: 8px">
              <el-tag
                v-for="p in selectedProductsForPrize"
                :key="p.id"
                closable
                style="margin: 0 6px 6px 0"
                @close="removeSelectedProductForPrize(p.id)"
              >{{ p.name }}（{{ p.productCode }}）</el-tag>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="成本价">
          <el-input-number v-model="prizeForm.costPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="回收价">
          <el-input-number v-model="prizeForm.recyclePrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原价/划线价">
          <el-input-number v-model="prizeForm.originalPrice" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="概率与库存">
          <span class="box-prize-fixed">开奖概率 100%，特殊开奖概率 100%，库存（签数）1（固定，不可改）</span>
        </el-form-item>
        <el-form-item label="主图 URL">
          <el-input v-model="prizeForm.imageUrl" placeholder="图片链接" />
        </el-form-item>
        <el-form-item label="规格属性">
          <el-input v-model="prizeForm.specAttributes" placeholder='JSON，如 {"Color":"红","Size":"M"}' />
        </el-form-item>
        <el-form-item label="开盒动画">
          <el-input v-model="prizeForm.openBoxAnimation" />
        </el-form-item>
        <el-form-item label="前面图片">
          <el-input v-model="prizeForm.frontImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="后面图片">
          <el-input v-model="prizeForm.backImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="左边图片">
          <el-input v-model="prizeForm.leftImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="右边图片">
          <el-input v-model="prizeForm.rightImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="顶部图片">
          <el-input v-model="prizeForm.topImage" placeholder="URL" />
        </el-form-item>
        <el-form-item label="底部图片">
          <el-input v-model="prizeForm.bottomImage" placeholder="URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="prizeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="prizeSubmitLoading" @click="handlePrizeDialogSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="productPickerVisible" title="选择商品" width="860px" :close-on-click-modal="false" append-to-body>
      <el-form :inline="true" style="margin-bottom: 12px">
        <el-form-item label="商品搜索">
          <el-input v-model="productQuery.keyword" placeholder="名称/编码" clearable style="width: 200px" @keyup.enter="handleProductSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleProductSearch">查询</el-button>
          <el-button @click="handleProductResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        ref="productTableRef"
        :data="productList"
        stripe
        style="width: 100%"
        v-loading="productListLoading"
        row-key="id"
        @selection-change="handleProductSelectionChange"
      >
        <el-table-column type="selection" width="50" :reserve-selection="true" />
        <el-table-column prop="productCode" label="商品编码" width="140" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="主图" width="72">
          <template #default="{ row }">
            <el-image v-if="row.mainImageUrl" :src="row.mainImageUrl" style="width: 40px; height: 40px" fit="cover" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="productQuery.page"
        v-model:page-size="productQuery.size"
        :total="productTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 12px; justify-content: flex-end"
        @current-change="fetchProductList"
        @size-change="fetchProductList"
      />
      <template #footer>
        <span style="float: left; line-height: 32px; color: var(--el-text-color-secondary)">已选择 {{ pickerSelection.length }} 件商品</span>
        <el-button @click="productPickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProductPicker">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="skuPickerVisible" title="SKU 挂箱" width="880px" :close-on-click-modal="false" append-to-body>
      <p class="sku-picker-hint">未绑定箱子的 SKU 可使用「挂入」；任意行可使用「复制挂箱」生成新 SKU（新编码）并写入本箱，源 SKU 不改动。</p>
      <el-form :inline="true" style="margin-bottom: 12px">
        <el-form-item label="关键词">
          <el-input v-model="skuPickerQuery.keyword" placeholder="名称/编码" clearable style="width: 200px" @keyup.enter="handleSkuPickerSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSkuPickerSearch">查询</el-button>
          <el-button @click="handleSkuPickerReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="skuPickerTableRows" stripe v-loading="skuPickerLoading" max-height="400">
        <el-table-column prop="skuCode" label="SKU 编码" width="132" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="绑定箱" width="88">
          <template #default="{ row }">
            <el-tag v-if="isSkuUnassigned(row)" size="small" type="info">未绑定</el-tag>
            <span v-else class="sku-box-bound">已绑定</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="64">
          <template #default="{ row }">{{ row.stockQuantity }}</template>
        </el-table-column>
        <el-table-column label="操作" width="168" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :disabled="!isSkuUnassigned(row)" @click="handleLinkSkuPick(row)">挂入</el-button>
            <el-button type="warning" link size="small" @click="handleCopySkuHang(row)">复制挂箱</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="skuPickerQuery.page"
        v-model:page-size="skuPickerQuery.size"
        :total="skuPickerTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 12px; justify-content: flex-end"
        @current-change="fetchSkuPickerList"
        @size-change="fetchSkuPickerList"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, ElTable } from 'element-plus'
import { getActivity } from '@/api/activity'
import { listBoxes, createBox, updateBox, deleteBox, linkSkuToBox, copySkuToBox } from '@/api/activityBox'
import { listSkus, createSku, updateSku, deleteSku } from '@/api/sku'
import { listProducts } from '@/api/product'
import type { ActivityVO } from '@/types/activity'
import type { ActivityBoxVO } from '@/types/activityBox'
import type { SkuVO, SkuSaveRequest } from '@/types/sku'
import type { ProductVO } from '@/types/product'

interface DraftLinkedSku {
  id: string
  skuCode: string
  name: string
}

interface DraftCopiedSku {
  sourceSkuId: string
  sourceSkuCode: string
  name: string
}

const ACT_TYPE_ICHIBAN = 7
/** 箱内商品固定规则（与后端 activity_box_item 一签一品一致） */
const BOX_SKU_REWARD_PROBABILITY = 100
const BOX_SKU_SPECIAL_REWARD_PROBABILITY = 100
const BOX_SKU_STOCK_QUANTITY = 1

const route = useRoute()
const router = useRouter()
const activityId = route.params.activityId as string

const actLoading = ref(false)
const activity = ref<ActivityVO | null>(null)

const loading = ref(false)
const list = ref<ActivityBoxVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 50 })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  boxStatus: 0,
})

const displayBoxNumber = ref(0)
const nextBoxNumberPreview = ref(1)

const formRules: FormRules = {
  boxStatus: [{ required: true, message: '请选择箱子状态', trigger: 'change' }],
}

const draftPrizes = ref<SkuSaveRequest[]>([])
const draftLinkedSkus = ref<DraftLinkedSku[]>([])
const draftCopiedSkus = ref<DraftCopiedSku[]>([])
const boxSkus = ref<SkuVO[]>([])
const boxSkusLoading = ref(false)

const skuPickerVisible = ref(false)
const skuPickerLoading = ref(false)
const skuPickerList = ref<SkuVO[]>([])
const skuPickerTotal = ref(0)
const skuPickerQuery = reactive({ page: 1, size: 10, keyword: '' })
const skuPickerContext = ref<'edit' | 'draft'>('edit')

const skuPickerTableRows = computed(() => {
  if (skuPickerContext.value !== 'draft') {
    return skuPickerList.value
  }
  const taken = new Set(draftLinkedSkus.value.map(d => d.id))
  return skuPickerList.value.filter(s => !taken.has(s.id))
})

const prizeDialogVisible = ref(false)
const prizeDialogTitle = ref('添加箱内商品')
const prizeSkuEditId = ref('')
const prizeSubmitLoading = ref(false)
const prizeFormRef = ref<FormInstance>()
const prizeFormMode = ref<'draft' | 'sku-new' | 'sku-edit'>('draft')

const productPickerVisible = ref(false)
const productListLoading = ref(false)
const productList = ref<ProductVO[]>([])
const productTotal = ref(0)
const productQuery = reactive({ page: 1, size: 10, keyword: '' })
const productTableRef = ref<InstanceType<typeof ElTable>>()
const pickerSelection = ref<ProductVO[]>([])
const allProductsMap = ref<Map<string, ProductVO>>(new Map())

const selectedProductsForPrize = computed(() =>
  prizeForm.selectedProductIds.map(id => allProductsMap.value.get(id)).filter(Boolean) as ProductVO[]
)

const prizeForm = reactive({
  skuCode: '',
  name: '',
  selectedProductIds: [] as string[],
  costPrice: undefined as number | undefined,
  recyclePrice: undefined as number | undefined,
  originalPrice: undefined as number | undefined,
  imageUrl: '',
  specAttributes: '',
  openBoxAnimation: '',
  frontImage: '',
  backImage: '',
  leftImage: '',
  rightImage: '',
  topImage: '',
  bottomImage: '',
})

const productIdsValidator = (_rule: unknown, value: string[], callback: (e?: Error) => void) => {
  if (!value || value.length === 0) callback(new Error('请选择关联商品'))
  else callback()
}

const prizeFormRules: FormRules = {
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  selectedProductIds: [{ required: true, validator: productIdsValidator, trigger: 'change' }],
}

const boxLimitReached = computed(() => {
  if (!activity.value || !activity.value.boxCount) return false
  return total.value >= activity.value.boxCount
})

function boxStatusTag(status: number) {
  switch (status) {
    case 1: return { type: 'success' as const, label: '进行中' }
    case 2: return { type: 'info' as const, label: '已结束' }
    default: return { type: 'warning' as const, label: '未开启' }
  }
}

function buildPrizePayload(): SkuSaveRequest {
  return {
    name: prizeForm.name,
    productIds: prizeForm.selectedProductIds.length > 0 ? JSON.stringify(prizeForm.selectedProductIds) : undefined,
    activityType: ACT_TYPE_ICHIBAN,
    costPrice: prizeForm.costPrice,
    recyclePrice: prizeForm.recyclePrice,
    originalPrice: prizeForm.originalPrice,
    rewardProbability: BOX_SKU_REWARD_PROBABILITY,
    specialRewardProbability: BOX_SKU_SPECIAL_REWARD_PROBABILITY,
    stockQuantity: BOX_SKU_STOCK_QUANTITY,
    imageUrl: prizeForm.imageUrl || undefined,
    specAttributes: prizeForm.specAttributes || undefined,
    openBoxAnimation: prizeForm.openBoxAnimation || undefined,
    frontImage: prizeForm.frontImage || undefined,
    backImage: prizeForm.backImage || undefined,
    leftImage: prizeForm.leftImage || undefined,
    rightImage: prizeForm.rightImage || undefined,
    topImage: prizeForm.topImage || undefined,
    bottomImage: prizeForm.bottomImage || undefined,
  }
}

function resetPrizeForm() {
  allProductsMap.value = new Map()
  Object.assign(prizeForm, {
    skuCode: '',
    name: '',
    selectedProductIds: [],
    costPrice: undefined,
    recyclePrice: undefined,
    originalPrice: undefined,
    imageUrl: '',
    specAttributes: '',
    openBoxAnimation: '',
    frontImage: '',
    backImage: '',
    leftImage: '',
    rightImage: '',
    topImage: '',
    bottomImage: '',
  })
}

async function rowToPrizeForm(row: SkuVO) {
  let ids: string[] = []
  if (row.productIds) {
    try { ids = JSON.parse(row.productIds) } catch { ids = [] }
  }
  if (ids.length > 0) {
    await loadProductsByIds(ids)
  }
  Object.assign(prizeForm, {
    skuCode: row.skuCode,
    name: row.name,
    selectedProductIds: ids,
    costPrice: row.costPrice ?? undefined,
    recyclePrice: row.recyclePrice ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    imageUrl: row.imageUrl || '',
    specAttributes: row.specAttributes || '',
    openBoxAnimation: row.openBoxAnimation || '',
    frontImage: row.frontImage || '',
    backImage: row.backImage || '',
    leftImage: row.leftImage || '',
    rightImage: row.rightImage || '',
    topImage: row.topImage || '',
    bottomImage: row.bottomImage || '',
  })
}

function openPrizeDialogForDraft() {
  prizeFormMode.value = 'draft'
  prizeDialogTitle.value = '添加箱内商品'
  prizeSkuEditId.value = ''
  resetPrizeForm()
  prizeDialogVisible.value = true
}

function openPrizeDialogForNewSku() {
  prizeFormMode.value = 'sku-new'
  prizeDialogTitle.value = '添加箱内商品'
  prizeSkuEditId.value = ''
  resetPrizeForm()
  prizeDialogVisible.value = true
}

async function openPrizeDialogEditSku(row: SkuVO) {
  prizeFormMode.value = 'sku-edit'
  prizeDialogTitle.value = '编辑箱内商品'
  prizeSkuEditId.value = row.id
  resetPrizeForm()
  await rowToPrizeForm(row)
  prizeDialogVisible.value = true
}

async function handlePrizeDialogSubmit() {
  const valid = await prizeFormRef.value?.validate().catch(() => false)
  if (!valid) return
  const payload = buildPrizePayload()
  prizeSubmitLoading.value = true
  try {
    if (prizeFormMode.value === 'draft') {
      draftPrizes.value.push({ ...payload })
      ElMessage.success('已加入列表，保存箱子时将创建 SKU 与签位')
      prizeDialogVisible.value = false
    } else if (prizeFormMode.value === 'sku-new') {
      await createSku(activityId, { ...payload, boxId: editId.value })
      ElMessage.success('已添加')
      prizeDialogVisible.value = false
      await fetchBoxSkus()
      await fetchBoxes()
    } else {
      await updateSku(activityId, prizeSkuEditId.value, payload)
      ElMessage.success('已更新')
      prizeDialogVisible.value = false
      await fetchBoxSkus()
      await fetchBoxes()
    }
  } finally {
    prizeSubmitLoading.value = false
  }
}

async function handleDeleteBoxSku(id: string) {
  await deleteSku(activityId, id)
  ElMessage.success('已删除')
  await fetchBoxSkus()
  await fetchBoxes()
}

async function fetchBoxSkus() {
  if (!editId.value) return
  boxSkusLoading.value = true
  try {
    const res = await listSkus(activityId, { page: 1, size: 500, boxId: editId.value } as any)
    boxSkus.value = res.data.records
  } finally {
    boxSkusLoading.value = false
  }
}

function isSkuUnassigned(row: SkuVO) {
  return !row.boxId || String(row.boxId).trim() === ''
}

function openSkuPicker(ctx: 'edit' | 'draft') {
  skuPickerContext.value = ctx
  skuPickerQuery.page = 1
  skuPickerQuery.keyword = ''
  skuPickerVisible.value = true
  fetchSkuPickerList()
}

async function fetchSkuPickerList() {
  skuPickerLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: skuPickerQuery.page,
      size: skuPickerQuery.size,
    }
    if (skuPickerQuery.keyword) params.keyword = skuPickerQuery.keyword
    const res = await listSkus(activityId, params as any)
    skuPickerList.value = res.data.records
    skuPickerTotal.value = res.data.total
  } finally {
    skuPickerLoading.value = false
  }
}

function handleSkuPickerSearch() {
  skuPickerQuery.page = 1
  fetchSkuPickerList()
}

function handleSkuPickerReset() {
  skuPickerQuery.keyword = ''
  skuPickerQuery.page = 1
  fetchSkuPickerList()
}

async function handleLinkSkuPick(row: SkuVO) {
  if (!isSkuUnassigned(row)) return
  if (skuPickerContext.value === 'draft') {
    if (draftLinkedSkus.value.some(d => d.id === row.id)) {
      ElMessage.warning('已在「直接挂入」列表中')
      return
    }
    draftLinkedSkus.value.push({
      id: row.id,
      skuCode: row.skuCode,
      name: row.name,
    })
    ElMessage.success('已加入，保存箱子时将挂入签位')
    skuPickerVisible.value = false
    return
  }
  try {
    await linkSkuToBox(activityId, editId.value, row.id)
    ElMessage.success('已挂入本箱')
    skuPickerVisible.value = false
    await fetchSkuPickerList()
    await fetchBoxSkus()
    await fetchBoxes()
  } catch {
    /* 全局拦截已提示 */
  }
}

async function handleCopySkuHang(row: SkuVO) {
  if (skuPickerContext.value === 'draft') {
    draftCopiedSkus.value.push({
      sourceSkuId: row.id,
      sourceSkuCode: row.skuCode,
      name: row.name,
    })
    ElMessage.success('已加入，保存箱子时将复制并挂箱')
    skuPickerVisible.value = false
    return
  }
  try {
    await copySkuToBox(activityId, editId.value, row.id)
    ElMessage.success('已复制并挂入本箱')
    skuPickerVisible.value = false
    await fetchSkuPickerList()
    await fetchBoxSkus()
    await fetchBoxes()
  } catch {
    /* 全局拦截已提示 */
  }
}

function removeSelectedProductForPrize(id: string) {
  prizeForm.selectedProductIds = prizeForm.selectedProductIds.filter(pid => pid !== id)
  prizeFormRef.value?.validateField('selectedProductIds')
}

async function openProductPicker() {
  productPickerVisible.value = true
  productQuery.page = 1
  productQuery.keyword = ''
  await fetchProductList()
  await nextTick()
  const selectedSet = new Set(prizeForm.selectedProductIds)
  productList.value.forEach(row => {
    productTableRef.value?.toggleRowSelection(row, selectedSet.has(row.id))
  })
}

function handleProductSelectionChange(selection: ProductVO[]) {
  pickerSelection.value = selection
}

function confirmProductPicker() {
  const newIds = pickerSelection.value.map(p => p.id)
  for (const p of pickerSelection.value) {
    allProductsMap.value.set(p.id, p)
  }
  prizeForm.selectedProductIds = newIds
  prizeFormRef.value?.validateField('selectedProductIds')
  productPickerVisible.value = false
}

async function fetchProductList() {
  productListLoading.value = true
  try {
    const params: Record<string, unknown> = { page: productQuery.page, size: productQuery.size }
    if (productQuery.keyword) params.keyword = productQuery.keyword
    const res = await listProducts(params as any)
    productList.value = res.data.records
    productTotal.value = res.data.total
    for (const p of res.data.records) {
      allProductsMap.value.set(p.id, p)
    }
    await nextTick()
    const selectedSet = new Set(prizeForm.selectedProductIds)
    productList.value.forEach(row => {
      productTableRef.value?.toggleRowSelection(row, selectedSet.has(row.id))
    })
  } finally {
    productListLoading.value = false
  }
}

function handleProductSearch() {
  productQuery.page = 1
  fetchProductList()
}

function handleProductResetQuery() {
  productQuery.keyword = ''
  productQuery.page = 1
  fetchProductList()
}

async function loadProductsByIds(_ids: string[]) {
  const res = await listProducts({ page: 1, size: 200 })
  for (const p of res.data.records) {
    allProductsMap.value.set(p.id, p)
  }
}

async function fetchActivity() {
  actLoading.value = true
  try {
    const res = await getActivity(activityId)
    activity.value = res.data
  } finally {
    actLoading.value = false
  }
}

async function fetchBoxes() {
  loading.value = true
  try {
    const res = await listBoxes(activityId, { page: query.page, size: query.size })
    list.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function refreshNextBoxNumberPreview() {
  const res = await listBoxes(activityId, { page: 1, size: 5000 })
  const nums = res.data.records.map(b => b.boxNumber)
  nextBoxNumberPreview.value = nums.length > 0 ? Math.max(...nums) + 1 : 1
}

async function handleAdd() {
  isEdit.value = false
  editId.value = ''
  draftPrizes.value = []
  draftLinkedSkus.value = []
  draftCopiedSkus.value = []
  form.boxStatus = 0
  await refreshNextBoxNumberPreview()
  dialogVisible.value = true
}

async function handleEdit(row: ActivityBoxVO) {
  isEdit.value = true
  editId.value = row.id
  displayBoxNumber.value = row.boxNumber
  form.boxStatus = row.boxStatus
  dialogVisible.value = true
  await fetchBoxSkus()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateBox(activityId, editId.value, { boxStatus: form.boxStatus })
      ElMessage.success('更新成功')
    } else {
      const res = await createBox(activityId, { boxStatus: form.boxStatus })
      const newBoxId = res.data as string
      for (const p of draftPrizes.value) {
        await createSku(activityId, { ...p, boxId: newBoxId })
      }
      for (const l of draftLinkedSkus.value) {
        await linkSkuToBox(activityId, newBoxId, l.id)
      }
      for (const c of draftCopiedSkus.value) {
        await copySkuToBox(activityId, newBoxId, c.sourceSkuId)
      }
      const n = draftPrizes.value.length + draftLinkedSkus.value.length + draftCopiedSkus.value.length
      ElMessage.success(n ? `创建成功，已写入 ${n} 条箱内签位` : '创建成功')
    }
    dialogVisible.value = false
    draftPrizes.value = []
    draftLinkedSkus.value = []
    draftCopiedSkus.value = []
    await fetchBoxes()
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteBox(activityId, id)
  ElMessage.success('删除成功')
  fetchBoxes()
}

onMounted(() => {
  fetchActivity()
  fetchBoxes()
})
</script>

<style scoped>
.boxes-page {
  padding: 0;
}
.box-prize-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
.box-prize-hint code {
  font-size: 12px;
}
.box-prize-fixed {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.box-prize-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.sku-picker-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
.sku-box-bound {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.box-number-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
