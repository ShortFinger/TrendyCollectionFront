import { describe, expect, it } from 'vitest'
import type { AxiosError } from 'axios'
import { isRequestTimeoutError } from './httpErrors'

function ax(partial: Pick<AxiosError, 'message' | 'code'>): AxiosError {
  return { isAxiosError: true, name: 'AxiosError', toJSON: () => ({}), ...partial } as AxiosError
}

describe('isRequestTimeoutError', () => {
  it('is true for ECONNABORTED', () => {
    expect(isRequestTimeoutError(ax({ message: 'aborted', code: 'ECONNABORTED' }))).toBe(true)
  })

  it('is true when message contains timeout', () => {
    expect(isRequestTimeoutError(ax({ message: 'timeout of 15000ms exceeded' }))).toBe(true)
  })

  it('is false for other axios errors', () => {
    expect(isRequestTimeoutError(ax({ message: 'Network Error', code: 'ERR_NETWORK' }))).toBe(false)
  })

  it('is false for non-axios errors', () => {
    expect(isRequestTimeoutError(new Error('timeout'))).toBe(false)
  })
})
