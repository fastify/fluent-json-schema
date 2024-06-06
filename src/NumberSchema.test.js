'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { NumberSchema } = require('./NumberSchema')
const S = require('./FluentJSONSchema')

describe('NumberSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(NumberSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      NumberSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(NumberSchema().valueOf(), {
        type: 'number'
      })
    })

    it('from S', () => {
      assert.deepStrictEqual(S.number().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'number'
      })
    })
  })

  describe('keywords:', () => {
    describe('minimum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.number().minimum(5.1)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'number',
                minimum: 5.1
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.number().minimum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minimum' must be a Number"
        )
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.number().maximum(5.1)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'number',
                maximum: 5.1
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.number().maximum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maximum' must be a Number"
        )
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.number().multipleOf(5.1)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'number',
                multipleOf: 5.1
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.number().multipleOf('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'multipleOf' must be a Number"
        )
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.number().exclusiveMinimum(5.1)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'number',
                exclusiveMinimum: 5.1
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.number().exclusiveMinimum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMinimum' must be a Number"
        )
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.number().exclusiveMaximum(5.1)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'number',
                exclusiveMaximum: 5.1
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.number().exclusiveMaximum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMaximum' must be a Number"
        )
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = NumberSchema().raw({ customKeyword: true }).valueOf()

        assert.deepStrictEqual(schema, {
          type: 'number',
          customKeyword: true
        })
      })
    })
  })

  it('works', () => {
    const schema = S.object()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .prop('age', S.number().maximum(10))
      .valueOf()

    assert.deepStrictEqual(schema, {
      $id: 'http://foo.com/user',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'A User desc',
      properties: { age: { maximum: 10, type: 'number' } },
      title: 'A User',
      type: 'object'
    })
  })
})
