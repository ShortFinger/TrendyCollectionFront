export interface UserAddressAdminVO {
  id: string
  userId: string
  districtCode: string
  provinceName: string
  cityName: string
  districtName: string
  detailAddress: string
  consigneeName: string
  consigneePhoneMasked: string
  isDefault: number
  createTime: string
}

export interface UserAddressQuery {
  page?: number
  size?: number
  userId?: string
  consigneePhone?: string
  districtCode?: string
  provinceKeyword?: string
  createTimeStart?: string
  createTimeEnd?: string
}
