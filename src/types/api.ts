/** 与 OrderAdmin `Result` 对齐 */
export interface Result<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  total: number
  page: number
  size: number
  records: T[]
}

export interface PageQuery {
  page?: number
  size?: number
}
