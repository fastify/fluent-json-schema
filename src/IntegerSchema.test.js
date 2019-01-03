const { IntegerSchema } = require('./IntegerSchema')
const { FluentSchema } = require('./FluentSchema')

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

    it('from FluentSchema', () => {
      expect(
        FluentSchema()
          .integer()
          .valueOf()
      ).toEqual({
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
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .integer()
                .minimum(5)
            )
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
        expect(() =>
          FluentSchema()
            .integer()
            .minimum('5.1')
        ).toThrow("'minimum' must be a Number")
      })
      it('invalid integer', () => {
        expect(() =>
          FluentSchema()
            .integer()
            .minimum(5.1)
        ).toThrow("'minimum' must be an Integer")
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .integer()
                .maximum(5)
            )
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
        expect(() =>
          FluentSchema()
            .integer()
            .maximum('5.1')
        ).toThrow("'maximum' must be a Number")
      })
      it('invalid float', () => {
        expect(() =>
          FluentSchema()
            .integer()
            .maximum(5.1)
        ).toThrow("'maximum' must be an Integer")
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .integer()
                .multipleOf(5)
            )

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
        expect(() =>
          FluentSchema()
            .integer()
            .multipleOf('5.1')
        ).toThrow("'multipleOf' must be a Number")
      })
      it('invalid integer', () => {
        expect(() =>
          FluentSchema()
            .integer()
            .multipleOf(5.1)
        ).toThrow("'multipleOf' must be an Integer")
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .integer()
                .exclusiveMinimum(5)
            )

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
        expect(() =>
          FluentSchema()
            .integer()
            .exclusiveMinimum('5.1')
        ).toThrow("'exclusiveMinimum' must be a Number")
      })
      it('invalid integer', () => {
        expect(() =>
          FluentSchema()
            .integer()
            .exclusiveMinimum(5.1)
        ).toThrow("'exclusiveMinimum' must be an Integer")
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .integer()
                .exclusiveMaximum(5)
            )

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
        expect(() =>
          FluentSchema()
            .integer()
            .exclusiveMaximum('5.1')
        ).toThrow("'exclusiveMaximum' must be a Number")
      })
      it('invalid integer', () => {
        expect(() =>
          FluentSchema()
            .integer()
            .exclusiveMaximum(5.1)
        ).toThrow("'exclusiveMaximum' must be an Integer")
      })
    })
  })

  it('works', () => {
    const schema = FluentSchema()
      .object()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .prop(
        'age',
        FluentSchema()
          .integer()
          .maximum(10)
      )
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
