'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { RawSchema } = require('./RawSchema')
const S = require('./FluentJSONSchema')

describe('RawSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(RawSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      RawSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('base', () => {
    it('parses type', () => {
      const input = S.enum(['foo']).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('adds an attribute', () => {
      const input = S.enum(['foo']).valueOf()
      const schema = RawSchema(input)
      const attribute = 'title'
      const modified = schema.title(attribute)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        ...input,
        title: attribute
      })
    })

    it("throws an exception if the input isn't an object", () => {
      assert.throws(
        () => RawSchema('boom!'),
        (err) =>
          err instanceof S.FluentSchemaError &&
          err.message === 'A fragment must be a JSON object'
      )
    })
  })

  describe('string', () => {
    it('parses type', () => {
      const input = S.string().valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('adds an attribute', () => {
      const input = S.string().valueOf()
      const schema = RawSchema(input)
      const modified = schema.minLength(3)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        minLength: 3,
        ...input
      })
    })

    it('parses a prop', () => {
      const input = S.string().minLength(5).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })

  describe('number', () => {
    it('parses type', () => {
      const input = S.number().valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('adds an attribute', () => {
      const input = S.number().valueOf()
      const schema = RawSchema(input)
      const modified = schema.maximum(3)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        maximum: 3,
        ...input
      })
    })

    it('parses a prop', () => {
      const input = S.number().maximum(5).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })

  describe('integer', () => {
    it('parses type', () => {
      const input = S.integer().valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('adds an attribute', () => {
      const input = S.integer().valueOf()
      const schema = RawSchema(input)
      const modified = schema.maximum(3)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        maximum: 3,
        ...input
      })
    })

    it('parses a prop', () => {
      const input = S.integer().maximum(5).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })

  describe('boolean', () => {
    it('parses type', () => {
      const input = S.boolean().valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })

  describe('object', () => {
    it('parses type', () => {
      const input = S.object().valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('parses properties', () => {
      const input = S.object().prop('foo').prop('bar', S.string()).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('parses nested properties', () => {
      const input = S.object()
        .prop('foo', S.object().prop('bar', S.string().minLength(3)))
        .valueOf()
      const schema = RawSchema(input)
      const modified = schema.prop('boom')
      assert.ok(modified.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        ...input,
        properties: {
          ...input.properties,
          boom: {}
        }
      })
    })

    it('parses definitions', () => {
      const input = S.object().definition('foo', S.string()).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })

  describe('array', () => {
    it('parses type', () => {
      const input = S.array().items(S.string()).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })

    it('parses properties', () => {
      const input = S.array().items(S.string()).valueOf()

      const schema = RawSchema(input).maxItems(1)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input,
        maxItems: 1
      })
    })

    it('parses nested properties', () => {
      const input = S.array()
        .items(
          S.object().prop(
            'foo',
            S.object().prop('bar', S.string().minLength(3))
          )
        )
        .valueOf()
      const schema = RawSchema(input)
      const modified = schema.maxItems(1)
      assert.ok(modified.isFluentSchema)
      assert.deepStrictEqual(modified.valueOf(), {
        ...input,
        maxItems: 1
      })
    })

    it('parses definitions', () => {
      const input = S.object().definition('foo', S.string()).valueOf()
      const schema = RawSchema(input)
      assert.ok(schema.isFluentSchema)
      assert.deepStrictEqual(schema.valueOf(), {
        ...input
      })
    })
  })
})
