<template>
  <div class="page boxes-page">
    <el-page-header @back="goBackToActivityList" :title="backListTitle" :content="activity?.title ?? '编辑箱子'" style="margin-bottom: 20px" />

    <el-card style="margin-bottom: 20px" v-loading="actLoading">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px">
          <span>{{ poolInfoCardTitle }}</span>
          <el-button type="primary" plain size="small" :disabled="!activity" @click="openSimDialog">模拟抽奖</el-button>
        </div>
      </template>
      <template v-if="activity">
        <el-descriptions :column="3" border>
          <el-descriptions-item :label="activity?.activityType === 'UNLIMITED' ? '活动名称' : '赏池名称'">{{ activity.title }}</el-descriptions-item>
          <el-descriptions-item label="活动 ID">{{ activity.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="activity.status === 'ON_SHELF' ? 'success' : 'info'">{{ activity.status === 'ON_SHELF' ? '上架' : '下架' }}</el-tag>
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

    <el-card style="margin-bottom: 20px" v-loading="levelCfgLoading">
      <template #header>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px">
          <span v-if="hideTierWeightUi">奖品等级（各档权重由系统自动均分，不参与开箱随机；保存后生效）</span>
          <span v-else>奖品等级（各档百分比合计须为 100%，保存后生效）</span>
          <div style="display: flex; gap: 8px">
            <el-button size="small" @click="addLevelRow">增行</el-button>
            <el-button type="primary" size="small" :loading="levelSaveLoading" @click="saveLevelConfig">保存等级配置</el-button>
          </div>
        </div>
      </template>
      <p class="ichiban-level-tip">
        <template v-if="hideTierWeightUi">说明：本玩法下各档权重由后台自动均分（合计 100%），不在此编辑；开箱仍按各 SKU 开奖概率及箱内规则。</template>
        <template v-else>说明：一番赏、无限赏玩法下，档位百分比<strong>不参与</strong>开箱随机，仅用于展示与运营；开箱仍按各 SKU 开奖概率及箱内规则。</template>
      </p>
      <el-table :data="levelTableRows" stripe size="small" style="width: 100%">
        <el-table-column label="标题" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.title" placeholder="如 大赏" />
          </template>
        </el-table-column>
        <el-table-column label="图标" min-width="120">
          <template #default="{ row }">
            <MediaUpload v-model="row.icon" :dir="levelUploadDir('icon')" />
          </template>
        </el-table-column>
        <el-table-column label="开盒动画" min-width="120">
          <template #default="{ row }">
            <MediaUpload v-model="row.openBoxAnimation" accept="video" :dir="levelUploadDir('animation')" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="110">
          <template #default="{ row }">
            <el-input-number v-model="row.sortOrder" :min="0" :step="1" controls-position="right" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column v-if="!hideTierWeightUi" label="百分比" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.tierWeight" :min="0.0001" :max="100" :precision="4" style="width: 100%" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="72" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeLevelRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!hideTierWeightUi" style="margin: 12px 0 0; font-size: 13px; color: var(--el-text-color-secondary)">
        当前合计：<strong :style="{ color: levelSumOk ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{ levelSumDisplay }}%</strong>
        <span v-if="!levelSumOk && levelTableRows.length > 0">（须等于 100 才能保存）</span>
      </p>
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              link
              type="primary"
              size="small"
              :disabled="boxLimitReached"
              :loading="duplicateLoadingId === row.id"
              @click="handleDuplicateBox(row)"
            >
              复制
            </el-button>
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
        <p v-if="!isEdit" class="box-status-hint" style="margin: 0 0 12px 100px; font-size: 13px; color: var(--el-text-color-secondary)">
          箱子状态由系统根据剩余签位与活动上架自动更新（进行中 / 已抽完），不可手动选择。
        </p>

        <el-divider content-position="left">箱内商品</el-divider>
        <p class="box-prize-hint">
          箱内规则：库存（签数）= <code>activity_box_item</code> 行数；减少库存会删除未抽中的签位。开奖概率固定 100%。<strong>未绑定</strong>的 SKU 可挂入；任意 SKU 可<strong>复制</strong>为新 SKU 挂箱（源 SKU 不变）。
        </p>

        <template v-if="isEdit">
          <div class="box-prize-toolbar">
            <el-button type="primary" plain size="small" @click="openSkuPicker('edit')">从已有 SKU 选择</el-button>
            <el-button type="primary" size="small" @click="openPrizeDialogForNewSku">新建箱内商品</el-button>
          </div>
          <el-table :data="boxSkus" stripe size="small" v-loading="boxSkusLoading" max-height="280">
            <el-table-column prop="skuCode" label="SKU 编码" width="130" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column label="等级" width="88">
              <template #default="{ row }">{{ row.rewardLevelTitle || '-' }}</template>
            </el-table-column>
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
            <el-table-column label="等级" width="88">
              <template #default="{ row }">{{ rewardLevelTitleForDraftSave(row) }}</template>
            </el-table-column>
            <el-table-column label="签数" width="72">
              <template #default="{ row }">{{ row.stockQuantity }}</template>
            </el-table-column>
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
            <el-table-column label="等级" width="88">
              <template #default="{ row }">{{ row.rewardLevelTitle || '-' }}</template>
            </el-table-column>
            <el-table-column label="签数" width="72">
              <template #default="{ row }">{{ row.stockQuantity }}</template>
            </el-table-column>
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
            <el-table-column label="等级" width="88">
              <template #default="{ row }">{{ row.rewardLevelTitle || '-' }}</template>
            </el-table-column>
            <el-table-column label="签数" width="72">
              <template #default="{ row }">{{ row.stockQuantity }}</template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" size="small" @click="draftCopiedSkus.splice($index, 1)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!draftPrizes.length && !draftLinkedSkus.length && !draftCopiedSkus.length" description="可新建、挂入或复制 SKU（均需设置签数），保存箱子时一并写入" :image-size="64" />
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
        <el-form-item v-if="rewardLevelOptions.length > 0" label="奖品等级" prop="rewardLevelId">
          <el-select v-model="prizeForm.rewardLevelId" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="opt in rewardLevelOptions" :key="opt.id" :label="opt.title" :value="opt.id" />
          </el-select>
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
        <el-form-item label="开奖概率">
          <span class="box-prize-fixed">固定 100%（与特殊开奖概率均为 100%，由后端写入）</span>
        </el-form-item>
        <el-form-item label="库存（签数）" prop="stockQuantity">
          <el-input-number v-model="prizeForm.stockQuantity" :min="1" :step="1" style="width: 100%" />
          <span class="box-prize-fixed" style="display: block; margin-top: 6px">对应生成相同条数的 activity_box_item；编辑时可减少库存以删除未抽中签位。</span>
        </el-form-item>
        <el-form-item label="无限库存">
          <el-switch v-model="prizeForm.isUnlimitedStock" disabled />
          <span class="box-prize-fixed" style="display: block; margin-top: 6px">箱子场景提交时会按规则强制为否，库存以签数为准。</span>
        </el-form-item>
        <el-form-item label="主图 URL">
          <MediaUpload v-model="prizeForm.imageUrl" :dir="skuUploadDir('icon')" />
        </el-form-item>
        <el-form-item label="规格属性">
          <el-input v-model="prizeForm.specAttributes" placeholder='JSON，如 {"Color":"红","Size":"M"}' />
        </el-form-item>
        <el-form-item label="开盒动画">
          <MediaUpload v-model="prizeForm.openBoxAnimation" accept="video" :dir="skuUploadDir('open-box-animation')" />
        </el-form-item>
        <el-form-item label="前面图片">
          <MediaUpload v-model="prizeForm.frontImage" :dir="skuUploadDir('front')" />
        </el-form-item>
        <el-form-item label="后面图片">
          <MediaUpload v-model="prizeForm.backImage" :dir="skuUploadDir('back')" />
        </el-form-item>
        <el-form-item label="左边图片">
          <MediaUpload v-model="prizeForm.leftImage" :dir="skuUploadDir('left')" />
        </el-form-item>
        <el-form-item label="右边图片">
          <MediaUpload v-model="prizeForm.rightImage" :dir="skuUploadDir('right')" />
        </el-form-item>
        <el-form-item label="顶部图片">
          <MediaUpload v-model="prizeForm.topImage" :dir="skuUploadDir('top')" />
        </el-form-item>
        <el-form-item label="底部图片">
          <MediaUpload v-model="prizeForm.bottomImage" :dir="skuUploadDir('bottom')" />
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
            <el-tag :type="row.status === 'ON_SHELF' ? 'success' : 'info'" size="small">{{ row.status === 'ON_SHELF' ? '上架' : '下架' }}</el-tag>
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
      <p class="sku-picker-hint">「挂入」「复制挂箱」前需填写签数（库存）。未绑定箱子的 SKU 可挂入；复制会生成新 SKU（新编码），源 SKU 不改动。</p>
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
        <el-table-column label="等级" width="80">
          <template #default="{ row }">{{ row.rewardLevelTitle || '-' }}</template>
        </el-table-column>
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
            <el-button type="primary" link size="small" :disabled="!isSkuUnassigned(row)" @click="openHangStockDialog('link', row)">挂入</el-button>
            <el-button type="warning" link size="small" @click="openHangStockDialog('copy', row)">复制挂箱</el-button>
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

    <el-dialog v-model="hangStockDialogVisible" title="设置签位库存" width="420px" :close-on-click-modal="false" append-to-body>
      <p v-if="hangTargetRow" class="hang-stock-desc">{{ hangTargetRow.skuCode }} · {{ hangTargetRow.name }}</p>
      <el-form label-width="110px">
        <el-form-item label="库存（签数）">
          <el-input-number v-model="hangStockQty" :min="1" :step="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <p class="hang-stock-tip">将写入对应条数的 activity_box_item。</p>
      <template #footer>
        <el-button @click="hangStockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmHangStock">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="simDialogVisible" title="抽奖模拟（内存统计，不发奖）" width="640px" destroy-on-close>
      <el-form v-if="!simResult" label-width="120px">
        <el-form-item label="参与人数 N">
          <el-input-number v-model="simForm.participantCount" :min="1" :max="10000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="每人次数 M">
          <el-input-number v-model="simForm.drawsPerPerson" :min="1" :max="500" style="width: 100%" />
        </el-form-item>
        <el-form-item label="随机种子">
          <el-input v-model="simForm.seedText" placeholder="可选，留空由服务端生成" clearable />
        </el-form-item>
        <el-form-item v-if="simBoxList.length > 0" label="箱子" :required="simBoxList.length > 1">
          <el-select
            v-model="simForm.boxId"
            placeholder="请选择箱子（多箱必选）"
            filterable
            clearable
            style="width: 100%"
            :loading="simBoxLoading"
          >
            <el-option
              v-for="b in simBoxList"
              :key="b.id"
              :label="`#${b.boxNumber}（剩余 ${b.boxItemLeft ?? 0}）`"
              :value="b.id"
            />
          </el-select>
          <div v-if="simBoxList.length === 1" style="margin-top: 4px; color: var(--el-text-color-secondary); font-size: 12px">
            仅一箱时可不选，由后端默认该箱
          </div>
        </el-form-item>
      </el-form>
      <template v-else>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="总次数">{{ simResult.totalDraws }}</el-descriptions-item>
          <el-descriptions-item label="成功/失败">{{ simResult.successCount }} / {{ simResult.failureCount }}</el-descriptions-item>
          <el-descriptions-item
            v-if="simResult.finalPrizeGrantCount != null && simResult.finalPrizeGrantCount > 0"
            label="最终赏自动发放次数"
          >
            {{ simResult.finalPrizeGrantCount }}
          </el-descriptions-item>
          <el-descriptions-item label="种子">{{ simResult.seed }}</el-descriptions-item>
          <el-descriptions-item label="耗时 ms">{{ simResult.durationMs }}</el-descriptions-item>
          <el-descriptions-item v-if="simResult.resolvedBoxId" label="模拟箱子" :span="2">{{ simResult.resolvedBoxId }}</el-descriptions-item>
          <el-descriptions-item label="每人命中" :span="2">
            min {{ simResult.perUser.minWins }} / max {{ simResult.perUser.maxWins }} / 均值 {{ simResult.perUser.meanWins.toFixed(4) }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 12px; font-weight: 600">按 SKU</div>
        <el-table :data="simResult.skuStats" size="small" max-height="220" style="width: 100%; margin-top: 8px">
          <el-table-column prop="skuId" label="SKU ID" min-width="120" show-overflow-tooltip />
          <el-table-column prop="name" label="名称" min-width="100" />
          <el-table-column prop="count" label="次数" width="90" />
          <el-table-column label="占比" width="100">
            <template #default="{ row }">{{ (row.ratio * 100).toFixed(2) }}%</template>
          </el-table-column>
        </el-table>
        <div v-if="simResult.levelStats?.length" style="margin-top: 12px; font-weight: 600">按奖品等级</div>
        <el-table
          v-if="simResult.levelStats?.length"
          :data="simResult.levelStats"
          size="small"
          max-height="200"
          style="width: 100%; margin-top: 8px"
        >
          <el-table-column prop="levelId" label="等级 ID" min-width="100" show-overflow-tooltip />
          <el-table-column prop="title" label="标题" min-width="80" />
          <el-table-column prop="count" label="次数" width="90" />
          <el-table-column label="占比" width="100">
            <template #default="{ row }">{{ (row.ratio * 100).toFixed(2) }}%</template>
          </el-table-column>
        </el-table>
      </template>
      <template #footer>
        <el-button @click="closeSimDialog">{{ simResult ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!simResult" type="primary" :loading="simLoading" @click="runSimulation">开始模拟</el-button>
        <el-button v-if="simResult" type="primary" @click="resetSimForm">再跑一次</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, ElTable } from 'element-plus'
import { getActivity, postLotterySimulation } from '@/api/activity'
import { listBoxes, createBox, updateBox, deleteBox, linkSkuToBox, copySkuToBox, duplicateBox } from '@/api/activityBox'
import { listSkus, createSku, updateSku, deleteSku } from '@/api/sku'
import { listRewardLevels, replaceRewardLevels } from '@/api/rewardLevel'
import { listProducts } from '@/api/product'
import MediaUpload from '@/components/MediaUpload.vue'
import type { ActivityVO, LotterySimulationRequest, LotterySimulationResponse } from '@/types/activity'
import type { ActivityBoxVO } from '@/types/activityBox'
import type { SkuVO, SkuSaveRequest } from '@/types/sku'
import type { RewardLevelVO } from '@/types/rewardLevel'
import type { ProductVO } from '@/types/product'
import {
  ActivityTypeCode,
  SkuMarketActivityType,
  isKujiActivityFamily,
  boxStatusTag as boxStatusTagFromCodes,
} from '@/constants/domainCodes'

interface DraftLinkedSku {
  id: string
  skuCode: string
  name: string
  rewardLevelTitle?: string
  stockQuantity: number
}

interface DraftCopiedSku {
  sourceSkuId: string
  sourceSkuCode: string
  name: string
  rewardLevelTitle?: string
  stockQuantity: number
}

/** 箱内开奖概率由后端固定为 100% */
const BOX_SKU_REWARD_PROBABILITY = 100
const BOX_SKU_SPECIAL_REWARD_PROBABILITY = 100

const route = useRoute()
const router = useRouter()
const activityId = route.params.activityId as string

const skuTempId = ref('')

function skuUploadDir(field: string) {
  if (prizeSkuEditId.value) {
    return `ichiban/${activityId}/boxes/${prizeSkuEditId.value}/${field}`
  }
  return `ichiban/${activityId}/boxes/temp-${skuTempId.value}/${field}`
}

function levelUploadDir(field: string) {
  return `ichiban/${activityId}/levels/${field}`
}

const actLoading = ref(false)
const activity = ref<ActivityVO | null>(null)

const activityListPath = computed(() =>
  route.path.startsWith('/gameplay/unlimited') ? '/gameplay/unlimited' : '/gameplay/ichiban'
)

const kujiKindShortLabel = computed(() =>
  route.path.startsWith('/gameplay/unlimited') ? '无限赏' : '一番赏'
)

const backListTitle = computed(() => `返回${kujiKindShortLabel.value}列表`)

const poolInfoCardTitle = computed(() =>
  activity.value?.activityType === ActivityTypeCode.UNLIMITED ? '活动信息' : '赏池信息'
)

function goBackToActivityList() {
  router.push(activityListPath.value)
}

const simDialogVisible = ref(false)
const simLoading = ref(false)
const simResult = ref<LotterySimulationResponse | null>(null)
const simForm = reactive({ participantCount: 100, drawsPerPerson: 1, seedText: '', boxId: '' })
const simBoxList = ref<ActivityBoxVO[]>([])
const simBoxLoading = ref(false)

async function openSimDialog() {
  simResult.value = null
  simForm.boxId = ''
  simBoxList.value = []
  simBoxLoading.value = true
  try {
    const res = await listBoxes(activityId, { page: 1, size: 100 })
    simBoxList.value = res.data?.records ?? []
    if (simBoxList.value.length === 1) {
      simForm.boxId = simBoxList.value[0].id
    }
  } finally {
    simBoxLoading.value = false
  }
  simDialogVisible.value = true
}

function closeSimDialog() {
  simDialogVisible.value = false
}

function resetSimForm() {
  simResult.value = null
}

async function runSimulation() {
  const seedStr = simForm.seedText.trim()
  if (seedStr !== '' && Number.isNaN(Number(seedStr))) {
    ElMessage.warning('随机种子须为数字')
    return
  }
  if (simBoxList.value.length > 1 && !simForm.boxId) {
    ElMessage.warning('请选择要模拟的箱子')
    return
  }

  simLoading.value = true
  try {
    const seed = seedStr === '' ? undefined : Number(seedStr)
    const payload: LotterySimulationRequest = {
      participantCount: simForm.participantCount,
      drawsPerPerson: simForm.drawsPerPerson,
      seed: seed ?? null,
    }
    if (simForm.boxId) {
      payload.boxId = simForm.boxId
    }
    const res = await postLotterySimulation(activityId, payload)
    simResult.value = res.data
  } catch {
    /* ElMessage 已由拦截器处理 */
  } finally {
    simLoading.value = false
  }
}

const levelCfgLoading = ref(false)
const levelSaveLoading = ref(false)
const levelTableRows = ref<
  { id?: string; title: string; icon?: string; openBoxAnimation?: string; sortOrder: number; tierWeight: number }[]
>([])

const levelSumDisplay = computed(() =>
  levelTableRows.value.reduce((s, r) => s + (Number(r.tierWeight) || 0), 0).toFixed(4)
)
const levelSumOk = computed(() => {
  if (levelTableRows.value.length === 0) return true
  const sum = levelTableRows.value.reduce((s, r) => s + (Number(r.tierWeight) || 0), 0)
  return Math.abs(sum - 100) <= 0.0001
})

/** 本页仅一番赏/无限赏；activity 未返回前也按隐藏处理，避免先闪现百分比列 */
const hideTierWeightUi = computed(() => {
  const a = activity.value
  if (!a) return true
  return isKujiActivityFamily(a.activityType)
})

const loading = ref(false)
const list = ref<ActivityBoxVO[]>([])
const total = ref(0)
const query = reactive({ page: 1, size: 50 })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<Record<string, unknown>>({})

const displayBoxNumber = ref(0)
const nextBoxNumberPreview = ref(1)

const formRules: FormRules = {}

const duplicateLoadingId = ref<string | null>(null)

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

const hangStockDialogVisible = ref(false)
const hangStockQty = ref(1)
const hangOp = ref<'link' | 'copy'>('link')
const hangTargetRow = ref<SkuVO | null>(null)

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

const rewardLevelOptions = ref<RewardLevelVO[]>([])

const prizeForm = reactive({
  skuCode: '',
  name: '',
  rewardLevelId: '' as string,
  selectedProductIds: [] as string[],
  costPrice: undefined as number | undefined,
  recyclePrice: undefined as number | undefined,
  originalPrice: undefined as number | undefined,
  stockQuantity: 1,
  isUnlimitedStock: false,
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

const prizeRewardLevelValidator = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (rewardLevelOptions.value.length > 0 && !value) callback(new Error('请选择奖品等级'))
  else callback()
}

const prizeFormRules: FormRules = {
  name: [{ required: true, message: '请输入奖品名称', trigger: 'blur' }],
  selectedProductIds: [{ required: true, validator: productIdsValidator, trigger: 'change' }],
  stockQuantity: [{ required: true, message: '请输入库存（签数）', trigger: 'blur' }],
  rewardLevelId: [{ validator: prizeRewardLevelValidator, trigger: 'change' }],
}

const boxLimitReached = computed(() => {
  if (!activity.value || !activity.value.boxCount) return false
  return total.value >= activity.value.boxCount
})

function boxStatusTag(status: string) {
  return boxStatusTagFromCodes(status)
}

function buildPrizePayload(): SkuSaveRequest {
  return {
    name: prizeForm.name,
    productIds: prizeForm.selectedProductIds.length > 0 ? JSON.stringify(prizeForm.selectedProductIds) : undefined,
    activityType: SkuMarketActivityType.LOTTERY,
    costPrice: prizeForm.costPrice,
    recyclePrice: prizeForm.recyclePrice,
    originalPrice: prizeForm.originalPrice,
    rewardProbability: BOX_SKU_REWARD_PROBABILITY,
    specialRewardProbability: BOX_SKU_SPECIAL_REWARD_PROBABILITY,
    stockQuantity: prizeForm.stockQuantity,
    // Box SKU rule: payload must always be finite stock.
    isUnlimitedStock: false,
    imageUrl: prizeForm.imageUrl || undefined,
    specAttributes: prizeForm.specAttributes || undefined,
    openBoxAnimation: prizeForm.openBoxAnimation || undefined,
    frontImage: prizeForm.frontImage || undefined,
    backImage: prizeForm.backImage || undefined,
    leftImage: prizeForm.leftImage || undefined,
    rightImage: prizeForm.rightImage || undefined,
    topImage: prizeForm.topImage || undefined,
    bottomImage: prizeForm.bottomImage || undefined,
    rewardLevelId: prizeForm.rewardLevelId || undefined,
  }
}

function resetPrizeForm() {
  allProductsMap.value = new Map()
  Object.assign(prizeForm, {
    skuCode: '',
    name: '',
    rewardLevelId: '',
    selectedProductIds: [],
    costPrice: undefined,
    recyclePrice: undefined,
    originalPrice: undefined,
    stockQuantity: 1,
    isUnlimitedStock: false,
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
    rewardLevelId: row.rewardLevelId || '',
    selectedProductIds: ids,
    costPrice: row.costPrice ?? undefined,
    recyclePrice: row.recyclePrice ?? undefined,
    originalPrice: row.originalPrice ?? undefined,
    stockQuantity: row.stockQuantity ?? 1,
    isUnlimitedStock: false,
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

async function fetchLevelConfig() {
  levelCfgLoading.value = true
  try {
    const { data } = await listRewardLevels(activityId)
    rewardLevelOptions.value = data
    levelTableRows.value = data.map(d => ({
      id: d.id,
      title: d.title,
      icon: d.icon ?? '',
      openBoxAnimation: d.openBoxAnimation ?? '',
      sortOrder: d.sortOrder,
      tierWeight: typeof d.tierWeight === 'number' ? d.tierWeight : Number(d.tierWeight),
    }))
  } catch {
    rewardLevelOptions.value = []
    levelTableRows.value = []
  } finally {
    levelCfgLoading.value = false
  }
}

function addLevelRow() {
  levelTableRows.value.push({
    title: '',
    icon: '',
    openBoxAnimation: '',
    sortOrder: levelTableRows.value.length + 1,
    tierWeight: 10,
  })
}

function removeLevelRow(index: number) {
  levelTableRows.value.splice(index, 1)
}

async function saveLevelConfig() {
  if (!hideTierWeightUi.value && !levelSumOk.value) {
    ElMessage.error('各档百分比之和须为 100')
    return
  }
  levelSaveLoading.value = true
  try {
    const items = levelTableRows.value.map(r => ({
      id: r.id,
      title: r.title.trim(),
      icon: r.icon?.trim() || undefined,
      openBoxAnimation: r.openBoxAnimation?.trim() || undefined,
      sortOrder: r.sortOrder,
      tierWeight: Number(r.tierWeight),
    }))
    if (items.some(i => !i.title)) {
      ElMessage.error('请填写等级标题')
      return
    }
    await replaceRewardLevels(activityId, items)
    ElMessage.success('等级配置已保存')
    await fetchLevelConfig()
  } finally {
    levelSaveLoading.value = false
  }
}

function rewardLevelTitleForDraftSave(row: SkuSaveRequest) {
  const id = row.rewardLevelId
  if (!id) return '-'
  return rewardLevelOptions.value.find(o => o.id === id)?.title ?? '-'
}

async function openPrizeDialogForDraft() {
  prizeFormMode.value = 'draft'
  prizeDialogTitle.value = '添加箱内商品'
  prizeSkuEditId.value = ''
  skuTempId.value = crypto.randomUUID()
  resetPrizeForm()
  await fetchLevelConfig()
  prizeDialogVisible.value = true
}

async function openPrizeDialogForNewSku() {
  prizeFormMode.value = 'sku-new'
  prizeDialogTitle.value = '添加箱内商品'
  prizeSkuEditId.value = ''
  skuTempId.value = crypto.randomUUID()
  resetPrizeForm()
  await fetchLevelConfig()
  prizeDialogVisible.value = true
}

async function openPrizeDialogEditSku(row: SkuVO) {
  prizeFormMode.value = 'sku-edit'
  prizeDialogTitle.value = '编辑箱内商品'
  prizeSkuEditId.value = row.id
  skuTempId.value = ''
  resetPrizeForm()
  await fetchLevelConfig()
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

async function openSkuPicker(ctx: 'edit' | 'draft') {
  skuPickerContext.value = ctx
  skuPickerQuery.page = 1
  skuPickerQuery.keyword = ''
  skuPickerVisible.value = true
  await fetchLevelConfig()
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

function openHangStockDialog(op: 'link' | 'copy', row: SkuVO) {
  if (op === 'link' && !isSkuUnassigned(row)) return
  if (op === 'link' && skuPickerContext.value === 'draft' && draftLinkedSkus.value.some(d => d.id === row.id)) {
    ElMessage.warning('已在「直接挂入」列表中')
    return
  }
  hangOp.value = op
  hangTargetRow.value = row
  hangStockQty.value = 1
  hangStockDialogVisible.value = true
}

async function confirmHangStock() {
  const row = hangTargetRow.value
  if (!row) return
  const qty = Math.max(1, Math.floor(Number(hangStockQty.value) || 1))
  const ctx = skuPickerContext.value

  try {
    if (ctx === 'draft' && hangOp.value === 'link') {
      draftLinkedSkus.value.push({
        id: row.id,
        skuCode: row.skuCode,
        name: row.name,
        rewardLevelTitle: row.rewardLevelTitle,
        stockQuantity: qty,
      })
      ElMessage.success('已加入，保存箱子时将挂入签位')
    } else if (ctx === 'draft' && hangOp.value === 'copy') {
      draftCopiedSkus.value.push({
        sourceSkuId: row.id,
        sourceSkuCode: row.skuCode,
        name: row.name,
        rewardLevelTitle: row.rewardLevelTitle,
        stockQuantity: qty,
      })
      ElMessage.success('已加入，保存箱子时将复制并挂箱')
    } else if (ctx === 'edit' && hangOp.value === 'link') {
      await linkSkuToBox(activityId, editId.value, row.id, qty)
      ElMessage.success('已挂入本箱')
      await fetchSkuPickerList()
      await fetchBoxSkus()
      await fetchBoxes()
    } else if (ctx === 'edit' && hangOp.value === 'copy') {
      await copySkuToBox(activityId, editId.value, row.id, qty)
      ElMessage.success('已复制并挂入本箱')
      await fetchSkuPickerList()
      await fetchBoxSkus()
      await fetchBoxes()
    }
    hangStockDialogVisible.value = false
    skuPickerVisible.value = false
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
  await refreshNextBoxNumberPreview()
  await fetchLevelConfig()
  dialogVisible.value = true
}

async function handleEdit(row: ActivityBoxVO) {
  isEdit.value = true
  editId.value = row.id
  displayBoxNumber.value = row.boxNumber
  dialogVisible.value = true
  await fetchLevelConfig()
  await fetchBoxSkus()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateBox(activityId, editId.value, {})
      ElMessage.success('更新成功')
    } else {
      const res = await createBox(activityId, {})
      const newBoxId = res.data as string
      for (const p of draftPrizes.value) {
        await createSku(activityId, { ...p, boxId: newBoxId })
      }
      for (const l of draftLinkedSkus.value) {
        await linkSkuToBox(activityId, newBoxId, l.id, l.stockQuantity)
      }
      for (const c of draftCopiedSkus.value) {
        await copySkuToBox(activityId, newBoxId, c.sourceSkuId, c.stockQuantity)
      }
      const totalItems =
        draftPrizes.value.reduce((s, p) => s + (p.stockQuantity ?? 0), 0) +
        draftLinkedSkus.value.reduce((s, l) => s + l.stockQuantity, 0) +
        draftCopiedSkus.value.reduce((s, c) => s + c.stockQuantity, 0)
      ElMessage.success(totalItems ? `创建成功，已写入 ${totalItems} 条签位` : '创建成功')
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

async function handleDuplicateBox(row: ActivityBoxVO) {
  try {
    await ElMessageBox.confirm(
      '将新建一箱并克隆当前箱内普通赏 SKU 与签位；一番赏活动将占用最终赏 SKU 库存（与手动「新增箱子」相同）。源箱数据不变。是否继续？',
      '复制箱子',
      { type: 'warning', confirmButtonText: '复制', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  duplicateLoadingId.value = row.id
  try {
    await duplicateBox(activityId, row.id)
    ElMessage.success('复制成功')
    await fetchBoxes()
  } finally {
    duplicateLoadingId.value = null
  }
}

onMounted(() => {
  fetchActivity()
  fetchBoxes()
  fetchLevelConfig()
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
.hang-stock-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.hang-stock-tip {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
.ichiban-level-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.55;
}
</style>
