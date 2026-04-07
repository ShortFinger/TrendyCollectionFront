import { describe, expect, it } from 'vitest'
import type { StsTokenResponse } from '@/types/oss'
import { buildPublicUrl } from './ossUrl'

describe('buildPublicUrl', () => {
  const sts: StsTokenResponse = {
    accessKeyId: 'ak',
    accessKeySecret: 'sk',
    securityToken: 'token',
    expiration: '2099-01-01T00:00:00Z',
    bucket: 'my-bucket',
    region: 'oss-cn-hangzhou',
    dir: 'temp/abc',
  }

  it('builds a complete aliyun oss https url', () => {
    expect(buildPublicUrl(sts, 'temp/abc/image.png')).toBe(
      'https://my-bucket.oss-cn-hangzhou.aliyuncs.com/temp/abc/image.png',
    )
  })

  it('strips leading slash from object key', () => {
    expect(buildPublicUrl(sts, '/temp/abc/image.png')).toBe(
      'https://my-bucket.oss-cn-hangzhou.aliyuncs.com/temp/abc/image.png',
    )
  })
})
