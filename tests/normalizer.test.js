import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { Normalizer, defaultProfile, normalize } from '../src/index.js'

const require = createRequire(import.meta.url)
const sample = require('../examples/sample.json')
const erc1155 = require('../examples/erc1155-enjin.json')
const invalid = require('../examples/invalid.json')

describe('normalize', () => {
  it('normalizes sample metadata with hash by default', () => {
    const result = normalize(sample)
    expect(result).toMatchObject({
      name: 'Demo Asset',
      description: 'Sandbox-only NFT metadata example.',
      image: 'ipfs://demo-asset'
    })
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('can disable hash generation', () => {
    const result = normalize(sample, { hash: false })
    expect(result.hash).toBeUndefined()
  })

  it('converts object attributes to array', () => {
    const result = normalize(erc1155)
    expect(result.attributes).toEqual([
      { trait_type: 'rarity', value: 'prototype' },
      { trait_type: 'supply', value: 16 }
    ])
  })

  it('includes metadata when requested', () => {
    const result = normalize(sample, { includeMeta: true, source: 'test' })
    expect(result._meta.profile.name).toBe('default')
    expect(result._meta.source).toBe('test')
  })
})

describe('Normalizer class', () => {
  it('throws for invalid payloads', () => {
    const normalizer = new Normalizer(defaultProfile)
    expect(() => normalizer.normalize(invalid)).toThrowError()
  })
})
