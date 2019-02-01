const { IntegerSchema } = require('./IntegerSchema')
const S = require('./FluentSchema')

describe('IntegerSchema', () => {
  it('defined', () => {
    expect(IntegerSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(IntegerSchema().valueOf()).toEqual({
        type: 'integer',
      })
    })

    it('from S', () => {
      expect(S.integer().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'integer',
      })
    })
  })

  describe('keywords:', () => {
    describe('minimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.integer().minimum(5))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'integer',
              minimum: 5,
            },
          },
          type: 'object',
        })
      })
      it('invalid number', () => {
        expect(() => S.integer().minimum('5.1')).toThrow(
          "'minimum' must be a Number"
        )
      })
      it('invalid integer', () => {
        expect(() => S.integer().minimum(5.1)).toThrow(
          "'minimum' must be an Integer"
        )
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.integer().maximum(5))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'integer',
              maximum: 5,
            },
          },
          type: 'object',
        })
      })
      it('invalid number', () => {
        expect(() => S.integer().maximum('5.1')).toThrow(
          "'maximum' must be a Number"
        )
      })
      it('invalid float', () => {
        expect(() => S.integer().maximum(5.1)).toThrow(
          "'maximum' must be an Integer"
        )
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.integer().multipleOf(5))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'integer',
              multipleOf: 5,
            },
          },
          type: 'object',
        })
      })
      it('invalid value', () => {
        expect(() => S.integer().multipleOf('5.1')).toThrow(
          "'multipleOf' must be a Number"
        )
      })
      it('invalid integer', () => {
        expect(() => S.integer().multipleOf(5.1)).toThrow(
          "'multipleOf' must be an Integer"
        )
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.integer().exclusiveMinimum(5))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'integer',
              exclusiveMinimum: 5,
            },
          },
          type: 'object',
        })
      })
      it('invalid number', () => {
        expect(() => S.integer().exclusiveMinimum('5.1')).toThrow(
          "'exclusiveMinimum' must be a Number"
        )
      })
      it('invalid integer', () => {
        expect(() => S.integer().exclusiveMinimum(5.1)).toThrow(
          "'exclusiveMinimum' must be an Integer"
        )
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          S.object()
            .prop(prop, S.integer().exclusiveMaximum(5))

            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'integer',
              exclusiveMaximum: 5,
            },
          },
          type: 'object',
        })
      })
      it('invalid number', () => {
        expect(() => S.integer().exclusiveMaximum('5.1')).toThrow(
          "'exclusiveMaximum' must be a Number"
        )
      })
      it('invalid integer', () => {
        expect(() => S.integer().exclusiveMaximum(5.1)).toThrow(
          "'exclusiveMaximum' must be an Integer"
        )
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

    expect(schema).toEqual({
      $id: 'http://foo.com/user',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'A User desc',
      properties: { age: { maximum: 10, type: 'integer' } },
      title: 'A User',
      type: 'object',
    })
  })
})
