'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { IntegerSchema } = require('./IntegerSchema')
const S = require('./FluentJSONSchema')

describe('IntegerSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(IntegerSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      IntegerSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(IntegerSchema().valueOf(), {
        type: 'integer'
      })
    })

    it('from S', () => {
      assert.deepStrictEqual(S.integer().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'integer'
      })
    })
  })

  describe('keywords:', () => {
    describe('minimum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.integer().minimum(5)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'integer',
                minimum: 5
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid number', () => {
        assert.throws(
          () => S.integer().minimum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minimum' must be a Number"
        )
      })
      it('invalid integer', () => {
        assert.throws(
          () => S.integer().minimum(5.1),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minimum' must be an Integer"
        )
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.integer().maximum(5)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'integer',
                maximum: 5
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid number', () => {
        assert.throws(
          () => S.integer().maximum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maximum' must be a Number"
        )
      })
      it('invalid float', () => {
        assert.throws(
          () => S.integer().maximum(5.1),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maximum' must be an Integer"
        )
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.integer().multipleOf(5)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'integer',
                multipleOf: 5
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid value', () => {
        assert.throws(
          () => S.integer().multipleOf('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'multipleOf' must be a Number"
        )
      })
      it('invalid integer', () => {
        assert.throws(
          () => S.integer().multipleOf(5.1),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'multipleOf' must be an Integer"
        )
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.integer().exclusiveMinimum(5)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'integer',
                exclusiveMinimum: 5
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid number', () => {
        assert.throws(
          () => S.integer().exclusiveMinimum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMinimum' must be a Number"
        )
      })
      it('invalid integer', () => {
        assert.throws(
          () => S.integer().exclusiveMinimum(5.1),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMinimum' must be an Integer"
        )
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        assert.deepStrictEqual(
          S.object().prop(prop, S.integer().exclusiveMaximum(5)).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'integer',
                exclusiveMaximum: 5
              }
            },
            type: 'object'
          }
        )
      })
      it('invalid number', () => {
        assert.throws(
          () => S.integer().exclusiveMaximum('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMaximum' must be a Number"
        )
      })
      it('invalid integer', () => {
        assert.throws(
          () => S.integer().exclusiveMaximum(5.1),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'exclusiveMaximum' must be an Integer"
        )
      })
    })
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = IntegerSchema().raw({ customKeyword: true }).valueOf()

      assert.deepStrictEqual(schema, {
        type: 'integer',
        customKeyword: true
      })
    })
  })

  it('works', () => {
    const schema = S.object()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .prop('age', S.integer().maximum(10))
      .valueOf()

    assert.deepStrictEqual(schema, {
      $id: 'http://foo.com/user',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'A User desc',
      properties: { age: { maximum: 10, type: 'integer' } },
      title: 'A User',
      type: 'object'
    })
  })
})
