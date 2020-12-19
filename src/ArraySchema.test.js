const { ArraySchema } = require('./ArraySchema')
const S = require('./FluentJSONSchema')

describe('ArraySchema', () => {
  it('defined', () => {
    expect(ArraySchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(ArraySchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(ArraySchema().valueOf()).toEqual({
        type: 'array',
      })
    })

    it('from S', () => {
      expect(S.array().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'array',
      })
    })
  })

  describe('keywords:', () => {
    describe('items', () => {
      it('valid object', () => {
        expect(
          ArraySchema()
            .items(S.number())
            .valueOf()
        ).toEqual({
          type: 'array',
          items: { type: 'number' },
        })
      })
      it('valid array', () => {
        expect(
          ArraySchema()
            .items([S.number(), S.string()])
            .valueOf()
        ).toEqual({
          type: 'array',
          items: [{ type: 'number' }, { type: 'string' }],
        })
      })
      it('invalid', () => {
        expect(() => ArraySchema().items('')).toThrowError(
          new S.FluentSchemaError("'items' must be a S or an array of S")
        )
      })
    })

    describe('additionalItems', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .items([S.number(), S.string()])
            .additionalItems(S.string())
            .valueOf()
        ).toEqual({
          type: 'array',
          items: [{ type: 'number' }, { type: 'string' }],
          additionalItems: { type: 'string' },
        })
      })
      it('false', () => {
        expect(
          ArraySchema()
            .items([S.number(), S.string()])
            .additionalItems(false)
            .valueOf()
        ).toEqual({
          type: 'array',
          items: [{ type: 'number' }, { type: 'string' }],
          additionalItems: false,
        })
      })
      it('invalid', () => {
        expect(() => ArraySchema().additionalItems('')).toThrowError(
          new S.FluentSchemaError("'additionalItems' must be a boolean or a S")
        )
      })
    })

    describe('contains', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .contains(S.string())
            .valueOf()
        ).toEqual({
          type: 'array',
          contains: { type: 'string' },
        })
      })
      it('invalid', () => {
        expect(() =>
          ArraySchema()
            .contains('')
            .valueOf()
        ).toThrowError(new S.FluentSchemaError("'contains' must be a S"))
      })
    })

    describe('uniqueItems', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .uniqueItems(true)
            .valueOf()
        ).toEqual({
          type: 'array',
          uniqueItems: true,
        })
      })
      it('invalid', () => {
        expect(() =>
          ArraySchema()
            .uniqueItems('invalid')
            .valueOf()
        ).toThrowError(
          new S.FluentSchemaError("'uniqueItems' must be a boolean")
        )
      })
    })

    describe('minItems', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .minItems(3)
            .valueOf()
        ).toEqual({
          type: 'array',
          minItems: 3,
        })
      })
      it('invalid', () => {
        expect(() =>
          ArraySchema()
            .minItems('3')
            .valueOf()
        ).toThrowError(new S.FluentSchemaError("'minItems' must be a integer"))
      })
    })

    describe('maxItems', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .maxItems(5)
            .valueOf()
        ).toEqual({
          type: 'array',
          maxItems: 5,
        })
      })
      it('invalid', () => {
        expect(() =>
          ArraySchema()
            .maxItems('5')
            .valueOf()
        ).toThrowError(new S.FluentSchemaError("'maxItems' must be a integer"))
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = ArraySchema()
          .raw({ customKeyword: true })
          .valueOf()

        expect(schema).toEqual({
          type: 'array',
          customKeyword: true,
        })
      })
    })

    describe('default array in an object', () => {
      it('valid', () => {
        const value = []
        expect(
          S.object()
            .prop('p1', ArraySchema().default(value))
            .valueOf().properties.p1.default
        ).toBe(value)
      })
    })
  })
})
