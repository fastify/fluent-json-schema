'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { NullSchema } = require('./NullSchema')
const S = require('./FluentJSONSchema')

describe('NullSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(NullSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      NullSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(NullSchema().valueOf(), {
        type: 'null'
      })
    })
    it('from S', () => {
      assert.deepStrictEqual(S.null().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'null'
      })
    })
  })

  it('sets a null type to the prop', () => {
    assert.strictEqual(
      S.object().prop('prop', S.null()).valueOf().properties.prop.type,
      'null'
    )
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = NullSchema().raw({ customKeyword: true }).valueOf()

      assert.deepStrictEqual(schema, {
        type: 'null',
        customKeyword: true
      })
    })
  })
})
