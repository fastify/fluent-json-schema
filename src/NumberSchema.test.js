const { NumberSchema } = require('./NumberSchema')
const { FluentSchema } = require('./FluentSchema')

describe('NumberSchema', () => {
  it('defined', () => {
    expect(NumberSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(NumberSchema().valueOf()).toEqual({
        type: 'number',
      })
    })

    it('from FluentSchema', () => {
      expect(
        FluentSchema()
          .number()
          .valueOf()
      ).toEqual({
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
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .number()
                .minimum(5.1)
            )
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
        expect(() =>
          FluentSchema()
            .number()
            .minimum('5.1')
        ).toThrow("'minimum' must be a Number")
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
                .number()
                .maximum(5.1)
            )
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
        expect(() =>
          FluentSchema()
            .number()
            .maximum('5.1')
        ).toThrow("'maximum' must be a Number")
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
                .number()
                .multipleOf(5.1)
            )

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
        expect(() =>
          FluentSchema()
            .number()
            .multipleOf('5.1')
        ).toThrow("'multipleOf' must be a Number")
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
                .number()
                .exclusiveMinimum(5.1)
            )

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
        expect(() =>
          FluentSchema()
            .number()
            .exclusiveMinimum('5.1')
        ).toThrow("'exclusiveMinimum' must be a Number")
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
                .number()
                .exclusiveMaximum(5.1)
            )

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
        expect(() =>
          FluentSchema()
            .number()
            .exclusiveMaximum('5.1')
        ).toThrow("'exclusiveMaximum' must be a Number")
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
          .number()
          .maximum(10)
      )
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
