export interface Result<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  total: number
  page: number
  size: number
  records: T[]
}

export interface PageQuery {
  page?: number
  size?: number
}
