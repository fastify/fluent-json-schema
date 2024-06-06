'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { MixedSchema } = require('./MixedSchema')
const S = require('./FluentJSONSchema')

describe('MixedSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(MixedSchema, undefined)
  })

  it('Expose symbol / 1', () => {
    assert.notStrictEqual(
      MixedSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  it('Expose symbol / 2', () => {
    const types = [
      S.TYPES.STRING,
      S.TYPES.NUMBER,
      S.TYPES.BOOLEAN,
      S.TYPES.INTEGER,
      S.TYPES.OBJECT,
      S.TYPES.ARRAY,
      S.TYPES.NULL
    ]
    assert.notStrictEqual(
      MixedSchema(types)[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('factory', () => {
    it('without params', () => {
      assert.deepStrictEqual(MixedSchema().valueOf(), {
        [Symbol.for('fluent-schema-object')]: true
      })
    })
  })

  describe('from S', () => {
    it('valid', () => {
      const types = [
        S.TYPES.STRING,
        S.TYPES.NUMBER,
        S.TYPES.BOOLEAN,
        S.TYPES.INTEGER,
        S.TYPES.OBJECT,
        S.TYPES.ARRAY,
        S.TYPES.NULL
      ]
      assert.deepStrictEqual(S.mixed(types).valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: types
      })
    })
    it('invalid param', () => {
      const types = ''
      assert.throws(
        () => S.mixed(types),
        (err) =>
          err instanceof S.FluentSchemaError &&
          err.message ===
            "Invalid 'types'. It must be an array of types. Valid types are string | number | boolean | integer | object | array | null"
      )
    })

    it('invalid type', () => {
      const types = ['string', 'invalid']
      assert.throws(
        () => S.mixed(types),
        (err) =>
          err instanceof S.FluentSchemaError &&
          err.message ===
            "Invalid 'types'. It must be an array of types. Valid types are string | number | boolean | integer | object | array | null"
      )
    })
  })

  it('sets a type object to the prop', () => {
    assert.deepStrictEqual(
      S.object()
        .prop(
          'prop',
          S.mixed([S.TYPES.STRING, S.TYPES.NUMBER]).minimum(10).maxLength(5)
        )
        .valueOf(),
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          prop: { maxLength: 5, minimum: 10, type: ['string', 'number'] }
        },
        type: 'object'
      }
    )
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const types = [S.TYPES.STRING, S.TYPES.NUMBER]

      const schema = S.mixed(types).raw({ customKeyword: true }).valueOf()

      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: ['string', 'number'],
        customKeyword: true
      })
    })
  })
})
