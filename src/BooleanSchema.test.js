'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { BooleanSchema } = require('./BooleanSchema')
const S = require('./FluentJSONSchema')

describe('BooleanSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(BooleanSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      BooleanSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(BooleanSchema().valueOf(), {
        type: 'boolean'
      })
    })
    it('from S', () => {
      assert.deepStrictEqual(S.boolean().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'boolean'
      })
    })
  })

  it('sets a null type to the prop', () => {
    assert.strictEqual(
      S.object().prop('prop', S.boolean()).valueOf().properties.prop.type,
      'boolean'
    )
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = BooleanSchema().raw({ customKeyword: true }).valueOf()

      assert.deepStrictEqual(schema, {
        type: 'boolean',
        customKeyword: true
      })
    })
  })
})
