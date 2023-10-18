'use strict'
const { setRaw, combineDeepmerge } = require('./utils')
const { StringSchema } = require('./StringSchema')
const { ObjectSchema } = require('./ObjectSchema')

describe('setRaw', () => {
  it('add an attribute to a prop using ObjectSchema', () => {
    const factory = ObjectSchema
    const schema = setRaw(
      { schema: { properties: [{ name: 'foo', type: 'string' }] }, factory },
      { nullable: true }
    )
    expect(schema.valueOf()).toEqual({
      properties: {
        foo: {
          nullable: true,
          type: 'string'
        }
      }
    })
  })

  it('add an attribute to a prop using StringSchema', () => {
    const factory = StringSchema
    const schema = setRaw(
      { schema: { type: 'string', properties: [] }, factory },
      { nullable: true }
    )
    expect(schema.valueOf()).toEqual({
      nullable: true,
      type: 'string'
    })
  })
})

describe('combineDeepmerge', () => {
  it('should merge empty arrays', () => {
    const result = combineDeepmerge([], [])
    expect(result).toEqual([])
  })

  it('should merge array with primitive values', () => {
    const result = combineDeepmerge([1], [2])
    expect(result).toEqual([1, 2])
  })

  it('should merge arrays with primitive values', () => {
    const result = combineDeepmerge([], [1, 2])
    expect(result).toEqual([1, 2])
  })

  it('should merge arrays with primitive values', () => {
    const result = combineDeepmerge([1, 2], [1, 2, 3])
    expect(result).toEqual([1, 2, 3])
  })

  it('should merge array with simple Schemas', () => {
    const result = combineDeepmerge([{ type: 'string' }], [{ type: 'string' }])
    expect(result).toEqual([{ type: 'string' }])
  })

  it('should merge array with named Schemas', () => {
    const result = combineDeepmerge([{ name: 'variant 1', type: 'string' }], [{ name: 'variant 2', type: 'string' }])
    expect(result).toEqual([{ name: 'variant 1', type: 'string' }, { name: 'variant 2', type: 'string' }])
  })

  it('should merge array with same named Schemas', () => {
    const result = combineDeepmerge([{ name: 'variant 2', type: 'string' }], [{ name: 'variant 2', type: 'number' }])
    expect(result).toEqual([{ name: 'variant 2', type: 'number' }])
  })

  it('should merge array with same named Schemas', () => {
    const result = combineDeepmerge([{ name: 'variant 2', type: 'string' }], [{ name: 'variant 2', type: 'number' }, { name: 'variant 1', type: 'string' }])
    expect(result).toEqual([{ name: 'variant 2', type: 'number' }, { name: 'variant 1', type: 'string' }])
  })
})
