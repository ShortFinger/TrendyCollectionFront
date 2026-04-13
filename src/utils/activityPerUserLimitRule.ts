import type { FormItemRule } from 'element-plus'

/** 与后端一致：0 表示不限制，不允许负数 */
export const perUserLimitFormRule: FormItemRule = {
  validator: (_rule, value: unknown, callback) => {
    const n = Number(value)
    if (value === undefined || value === null || Number.isNaN(n)) {
      callback(new Error('请输入每用户限次'))
    } else if (n < 0) {
      callback(new Error('每用户限次不能为负数'))
    } else {
      callback()
    }
  },
  trigger: 'blur',
}
