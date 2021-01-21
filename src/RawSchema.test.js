const { RawSchema } = require('./RawSchema')
const S = require('./FluentJSONSchema')

describe('RawSchema', () => {
  it('defined', () => {
    expect(RawSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(RawSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('base', () => {
    it('parses type', () => {
      const input = S.enum(['foo']).valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('adds an attribute', () => {
      const input = S.enum(['foo']).valueOf()
      const schema = RawSchema(input)
      const attribute = 'title'
      const modified = schema.title(attribute)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        ...input,
        title: attribute,
      })
    })

    it("throws an exception if the input isn't an object", () => {
      expect(() => RawSchema('boom!')).toThrowError(
        new S.FluentSchemaError('A fragment must be a JSON object')
      )
    })
  })

  describe('string', () => {
    it('parses type', () => {
      const input = S.string().valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('adds an attribute', () => {
      const input = S.string().valueOf()
      const schema = RawSchema(input)
      const modified = schema.minLength(3)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        minLength: 3,
        ...input,
      })
    })

    it('parses a prop', () => {
      const input = S.string()
        .minLength(5)
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })

  describe('number', () => {
    it('parses type', () => {
      const input = S.number().valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('adds an attribute', () => {
      const input = S.number().valueOf()
      const schema = RawSchema(input)
      const modified = schema.maximum(3)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        maximum: 3,
        ...input,
      })
    })

    it('parses a prop', () => {
      const input = S.number()
        .maximum(5)
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })

  describe('integer', () => {
    it('parses type', () => {
      const input = S.integer().valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('adds an attribute', () => {
      const input = S.integer().valueOf()
      const schema = RawSchema(input)
      const modified = schema.maximum(3)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        maximum: 3,
        ...input,
      })
    })

    it('parses a prop', () => {
      const input = S.integer()
        .maximum(5)
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })

  describe('boolean', () => {
    it('parses type', () => {
      const input = S.boolean().valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })

  describe('object', () => {
    it('parses type', () => {
      const input = S.object().valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('parses properties', () => {
      const input = S.object()
        .prop('foo')
        .prop('bar', S.string())
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('parses nested properties', () => {
      const input = S.object()
        .prop('foo', S.object().prop('bar', S.string().minLength(3)))
        .valueOf()
      const schema = RawSchema(input)
      const modified = schema.prop('boom')
      expect(modified.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        ...input,
        properties: {
          ...input.properties,
          boom: {},
        },
      })
    })

    it('parses definitions', () => {
      const input = S.object()
        .definition('foo', S.string())
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })

  describe('array', () => {
    it('parses type', () => {
      const input = S.array()
        .items(S.string())
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })

    it('parses properties', () => {
      const input = S.array()
        .items(S.string())
        .valueOf()

      const schema = RawSchema(input).maxItems(1)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
        maxItems: 1,
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
      expect(modified.isFluentSchema).toBeTruthy()
      expect(modified.valueOf()).toEqual({
        ...input,
        maxItems: 1,
      })
    })

    it('parses definitions', () => {
      const input = S.object()
        .definition('foo', S.string())
        .valueOf()
      const schema = RawSchema(input)
      expect(schema.isFluentSchema).toBeTruthy()
      expect(schema.valueOf()).toEqual({
        ...input,
      })
    })
  })
})
