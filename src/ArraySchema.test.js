const { ArraySchema } = require('./ArraySchema')
const { FluentSchema } = require('./FluentSchema')

describe('ArraySchema', () => {
  it('defined', () => {
    expect(ArraySchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(ArraySchema().valueOf()).toEqual({
        type: 'array',
      })
    })

    it('from FluentSchema', () => {
      expect(
        FluentSchema()
          .asArray()
          .valueOf()
      ).toEqual({
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
            .items(FluentSchema().asNumber())
            .valueOf()
        ).toEqual({
          type: 'array',
          items: { type: 'number' },
        })
      })
      it('valid array', () => {
        expect(
          ArraySchema()
            .items([FluentSchema().asNumber(), FluentSchema().asString()])
            .valueOf()
        ).toEqual({
          type: 'array',
          items: [{ type: 'number' }, { type: 'string' }],
        })
      })
      it('invalid', () => {
        expect(() => ArraySchema().items('')).toThrow(
          "'items' must be a FluentSchema or an array of FluentSchema"
        )
      })
    })

    describe('additionalItems', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .items([FluentSchema().asNumber(), FluentSchema().asString()])
            .additionalItems(FluentSchema().asString())
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
            .items([FluentSchema().asNumber(), FluentSchema().asString()])
            .additionalItems(false)
            .valueOf()
        ).toEqual({
          type: 'array',
          items: [{ type: 'number' }, { type: 'string' }],
          additionalItems: false,
        })
      })
      it('invalid', () => {
        expect(() => ArraySchema().additionalItems('')).toThrow(
          "'additionalItems' must be a boolean or a FluentSchema"
        )
      })
    })

    describe('contains', () => {
      it('valid', () => {
        expect(
          ArraySchema()
            .contains(FluentSchema().asString())
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
        ).toThrow("'contains' must be a FluentSchema")
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
        ).toThrow("'uniqueItems' must be a boolean")
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
        ).toThrow("'minItems' must be a integer")
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
        ).toThrow("'maxItems' must be a integer")
      })
    })
  })
})
