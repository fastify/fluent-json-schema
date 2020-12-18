const { NumberSchema } = require('./NumberSchema')
const S = require('./FluentJSONSchema')

describe('NumberSchema', () => {
  it('defined', () => {
    expect(NumberSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(NumberSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(NumberSchema().valueOf()).toEqual({
        type: 'number',
      })
    })

    it('from S', () => {
      expect(S.number().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'number',
      })
    })
  })

  describe('keywords:', () => {
    describe('minimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.number().minimum(5.1))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'number',
              minimum: 5.1,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.number().minimum('5.1')).toThrowError(
          new S.FluentSchemaError("'minimum' must be a Number")
        )
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.number().maximum(5.1))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'number',
              maximum: 5.1,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.number().maximum('5.1')).toThrowError(
          new S.FluentSchemaError("'maximum' must be a Number")
        )
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.number().multipleOf(5.1))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'number',
              multipleOf: 5.1,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.number().multipleOf('5.1')).toThrowError(
          new S.FluentSchemaError("'multipleOf' must be a Number")
        )
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.number().exclusiveMinimum(5.1))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'number',
              exclusiveMinimum: 5.1,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.number().exclusiveMinimum('5.1')).toThrowError(
          new S.FluentSchemaError("'exclusiveMinimum' must be a Number")
        )
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.number().exclusiveMaximum(5.1))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'number',
              exclusiveMaximum: 5.1,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.number().exclusiveMaximum('5.1')).toThrowError(
          new S.FluentSchemaError("'exclusiveMaximum' must be a Number")
        )
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = NumberSchema()
          .raw({ customKeyword: true })
          .valueOf()

        expect(schema).toEqual({
          type: 'number',
          customKeyword: true,
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

    expect(schema).toEqual({
      $id: 'http://foo.com/user',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'A User desc',
      properties: { age: { maximum: 10, type: 'number' } },
      title: 'A User',
      type: 'object',
    })
  })
})
