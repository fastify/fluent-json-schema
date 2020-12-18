const { NullSchema } = require('./NullSchema')
const S = require('./FluentJSONSchema')

describe('NullSchema', () => {
  it('defined', () => {
    expect(NullSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(NullSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(NullSchema().valueOf()).toEqual({
        type: 'null',
      })
    })
    it('from S', () => {
      expect(S.null().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'null',
      })
    })
  })

  it('sets a null type to the prop', () => {
    expect(
      S.object()
        .prop('prop', S.null())
        .valueOf().properties.prop.type
    ).toEqual('null')
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = NullSchema()
        .raw({ customKeyword: true })
        .valueOf()

      expect(schema).toEqual({
        type: 'null',
        customKeyword: true,
      })
    })
  })
})
