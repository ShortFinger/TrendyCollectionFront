import OSS from 'ali-oss'
import { getStsToken, getCmsStsToken } from '@/api/oss'
import type { StsTokenResponse, OssUploadResult } from '@/types/oss'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const VIDEO_TYPES = ['video/mp4', 'video/webm']
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES]
const MAX_FILE_SIZE = 50 * 1024 * 1024

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`不支持的文件类型: ${file.type}。支持: JPG, PNG, WebP, GIF, MP4, WebM`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制（最大 50MB），当前: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
  }
}

function generateObjectKey(dir: string, fileName: string): string {
  const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : ''
  const uuid = crypto.randomUUID()
  const normalizedDir = dir.endsWith('/') ? dir : dir + '/'
  return `${normalizedDir}${uuid}${ext}`
}

function createOssClient(sts: StsTokenResponse): OSS {
  return new OSS({
    region: sts.region,
    accessKeyId: sts.accessKeyId,
    accessKeySecret: sts.accessKeySecret,
    stsToken: sts.securityToken,
    bucket: sts.bucket,
  })
}

export async function uploadFile(
  file: File,
  dir: string,
  onProgress?: (percent: number) => void
): Promise<OssUploadResult> {
  validateFile(file)

  const res = await getStsToken(dir)
  const sts = res.data
  const client = createOssClient(sts)
  const objectKey = generateObjectKey(sts.dir, file.name)

  await client.multipartUpload(objectKey, file, {
    progress: (p: number) => {
      if (onProgress) {
        onProgress(Math.round(p * 100))
      }
    },
  })

  return { objectKey, name: file.name }
}

export async function uploadCmsFile(
  file: File,
  pageKey: string,
  onProgress?: (percent: number) => void
): Promise<OssUploadResult> {
  validateFile(file)

  const res = await getCmsStsToken(pageKey)
  const sts = res.data
  const client = createOssClient(sts)
  const objectKey = generateObjectKey(sts.dir, file.name)

  await client.multipartUpload(objectKey, file, {
    progress: (p: number) => {
      if (onProgress) {
        onProgress(Math.round(p * 100))
      }
    },
  })

  return { objectKey, name: file.name }
}
