import { describe, it, expect } from 'vitest'
import { fallbackPathForRouteName } from './tabCloseFallback'

describe('tabCloseFallback', () => {
  it('maps known hidden route names', () => {
    expect(fallbackPathForRouteName('IchibanBoxes')).toBe('/gameplay/ichiban')
    expect(fallbackPathForRouteName('GachaPrizes')).toBe('/gameplay/gacha')
  })

  it('defaults to dashboard', () => {
    expect(fallbackPathForRouteName('Unknown')).toBe('/dashboard')
  })
})
