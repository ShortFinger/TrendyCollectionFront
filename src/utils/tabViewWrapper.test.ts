import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  allocateCacheName,
  getOrCreateTabWrapper,
  destroyTabWrapper,
  destroyAllTabWrappers,
  registeredCacheNames,
} from './tabViewWrapper'

const Dummy = defineComponent({
  name: 'Dummy',
  setup: () => () => h('span', 'x'),
})

beforeEach(() => {
  destroyAllTabWrappers()
})

describe('tabViewWrapper', () => {
  it('allocateCacheName is stable per fullPath', () => {
    expect(allocateCacheName('/a')).toBe(allocateCacheName('/a'))
    expect(allocateCacheName('/b')).not.toBe(allocateCacheName('/a'))
  })

  it('destroyTabWrapper clears registration', () => {
    allocateCacheName('/x')
    expect(registeredCacheNames().length).toBe(1)
    destroyTabWrapper('/x')
    expect(registeredCacheNames().length).toBe(0)
  })

  it('getOrCreateTabWrapper returns same component for same path', () => {
    allocateCacheName('/p')
    const w1 = getOrCreateTabWrapper('/p', Dummy)
    const w2 = getOrCreateTabWrapper('/p', Dummy)
    expect(w1).toBe(w2)
  })

  it('getOrCreateTabWrapper throws if cache name not allocated', () => {
    expect(() => getOrCreateTabWrapper('/z', Dummy)).toThrow(/allocateCacheName/)
  })
})
