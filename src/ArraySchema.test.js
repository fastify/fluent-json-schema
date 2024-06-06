'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { ArraySchema } = require('./ArraySchema')
const S = require('./FluentJSONSchema')

describe('ArraySchema', () => {
  it('defined', () => {
    assert.notStrictEqual(ArraySchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      ArraySchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(ArraySchema().valueOf(), {
        type: 'array'
      })
    })

    it('from S', () => {
      assert.deepStrictEqual(S.array().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'array'
      })
    })
  })

  describe('keywords:', () => {
    describe('items', () => {
      it('valid object', () => {
        assert.deepStrictEqual(ArraySchema().items(S.number()).valueOf(), {
          type: 'array',
          items: { type: 'number' }
        })
      })
      it('valid array', () => {
        assert.deepStrictEqual(
          ArraySchema().items([S.number(), S.string()]).valueOf(),
          {
            type: 'array',
            items: [{ type: 'number' }, { type: 'string' }]
          }
        )
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().items(''),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'items' must be a S or an array of S"
        )
      })
    })

    describe('additionalItems', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          ArraySchema()
            .items([S.number(), S.string()])
            .additionalItems(S.string())
            .valueOf(),
          {
            type: 'array',
            items: [{ type: 'number' }, { type: 'string' }],
            additionalItems: { type: 'string' }
          }
        )
      })
      it('false', () => {
        assert.deepStrictEqual(
          ArraySchema()
            .items([S.number(), S.string()])
            .additionalItems(false)
            .valueOf(),
          {
            type: 'array',
            items: [{ type: 'number' }, { type: 'string' }],
            additionalItems: false
          }
        )
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().additionalItems(''),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'additionalItems' must be a boolean or a S"
        )
      })
    })

    describe('contains', () => {
      it('valid', () => {
        assert.deepStrictEqual(ArraySchema().contains(S.string()).valueOf(), {
          type: 'array',
          contains: { type: 'string' }
        })
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().contains('').valueOf(),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'contains' must be a S"
        )
      })
    })

    describe('uniqueItems', () => {
      it('valid', () => {
        assert.deepStrictEqual(ArraySchema().uniqueItems(true).valueOf(), {
          type: 'array',
          uniqueItems: true
        })
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().uniqueItems('invalid').valueOf(),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'uniqueItems' must be a boolean"
        )
      })
    })

    describe('minItems', () => {
      it('valid', () => {
        assert.deepStrictEqual(ArraySchema().minItems(3).valueOf(), {
          type: 'array',
          minItems: 3
        })
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().minItems('3').valueOf(),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minItems' must be a integer"
        )
      })
    })

    describe('maxItems', () => {
      it('valid', () => {
        assert.deepStrictEqual(ArraySchema().maxItems(5).valueOf(), {
          type: 'array',
          maxItems: 5
        })
      })
      it('invalid', () => {
        assert.throws(
          () => ArraySchema().maxItems('5').valueOf(),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maxItems' must be a integer"
        )
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = ArraySchema().raw({ customKeyword: true }).valueOf()

        assert.deepStrictEqual(schema, {
          type: 'array',
          customKeyword: true
        })
      })
    })

    describe('default array in an object', () => {
      it('valid', () => {
        const value = []
        assert.deepStrictEqual(
          S.object().prop('p1', ArraySchema().default(value)).valueOf()
            .properties.p1.default,
          value
        )
      })
    })
  })
})
