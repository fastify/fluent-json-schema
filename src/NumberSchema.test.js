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
          .asNumber()
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
            .asObject()
            .prop(
              prop,
              FluentSchema()
                .asNumber()
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
            .asNumber()
            .minimum('5.1')
        ).toThrow("'minimum' must be a Number")
      })
    })
    describe('maximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .asObject()
            .prop(
              prop,
              FluentSchema()
                .asNumber()
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
            .asNumber()
            .maximum('5.1')
        ).toThrow("'maximum' must be a Number")
      })
    })
    describe('multipleOf', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .asObject()
            .prop(
              prop,
              FluentSchema()
                .asNumber()
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
            .asNumber()
            .multipleOf('5.1')
        ).toThrow("'multipleOf' must be a Number")
      })
    })

    describe('exclusiveMinimum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .asObject()
            .prop(
              prop,
              FluentSchema()
                .asNumber()
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
            .asNumber()
            .exclusiveMinimum('5.1')
        ).toThrow("'exclusiveMinimum' must be a Number")
      })
    })
    describe('exclusiveMaximum', () => {
      it('valid', () => {
        const prop = 'prop'
        expect(
          FluentSchema()
            .asObject()
            .prop(
              prop,
              FluentSchema()
                .asNumber()
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
            .asNumber()
            .exclusiveMaximum('5.1')
        ).toThrow("'exclusiveMaximum' must be a Number")
      })
    })
  })

  it('works', () => {
    // TODO LS https://json-schema.org/latest/json-schema-core.html#idExamples
    const schema = FluentSchema()
      .asObject()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .prop(
        'age',
        FluentSchema()
          .asNumber()
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
