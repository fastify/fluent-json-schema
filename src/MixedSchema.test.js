const { MixedSchema } = require('./MixedSchema')
const S = require('./FluentJSONSchema')

describe('MixedSchema', () => {
  it('defined', () => {
    expect(MixedSchema).toBeDefined()
  })

  it('Expose symbol / 1', () => {
    expect(MixedSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  it('Expose symbol / 2', () => {
    const types = [
      S.TYPES.STRING,
      S.TYPES.NUMBER,
      S.TYPES.BOOLEAN,
      S.TYPES.INTEGER,
      S.TYPES.OBJECT,
      S.TYPES.ARRAY,
      S.TYPES.NULL,
    ]
    expect(MixedSchema(types)[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('factory', () => {
    it('without params', () => {
      expect(MixedSchema().valueOf()).toEqual({
        [Symbol.for('fluent-schema-object')]: true,
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
        S.TYPES.NULL,
      ]
      expect(S.mixed(types).valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: types,
      })
    })
    it('invalid param', () => {
      const types = ''
      expect(() => {
        S.mixed(types)
      }).toThrowError(
        new S.FluentSchemaError(
          "Invalid 'types'. It must be an array of types. Valid types are string | number | boolean | integer | object | array | null"
        )
      )
    })

    it('invalid type', () => {
      const types = ['string', 'invalid']
      expect(() => {
        S.mixed(types)
      }).toThrowError(
        new S.FluentSchemaError(
          "Invalid 'types'. It must be an array of types. Valid types are string | number | boolean | integer | object | array | null"
        )
      )
    })
  })

  it('sets a type object to the prop', () => {
    expect(
      S.object()
        .prop(
          'prop',
          S.mixed([S.TYPES.STRING, S.TYPES.NUMBER])
            .minimum(10)
            .maxLength(5)
        )
        .valueOf()
    ).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: {
        prop: { maxLength: 5, minimum: 10, type: ['string', 'number'] },
      },
      type: 'object',
    })
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const types = [S.TYPES.STRING, S.TYPES.NUMBER]

      const schema = S.mixed(types)
        .raw({ customKeyword: true })
        .valueOf()

      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: ['string', 'number'],
        customKeyword: true,
      })
    })
  })
})
