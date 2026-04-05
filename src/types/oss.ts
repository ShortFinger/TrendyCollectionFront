export interface StsTokenResponse {
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
  bucket: string
  region: string
  dir: string
}

export interface OssUploadResult {
  objectKey: string
  name: string
}

export type OssDir = 'products' | 'skus' | 'activities' | string
