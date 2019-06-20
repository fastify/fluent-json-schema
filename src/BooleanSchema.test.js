const { BooleanSchema } = require('./BooleanSchema')
const S = require('./FluentSchema')

describe('BooleanSchema', () => {
  it('defined', () => {
    expect(BooleanSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(BooleanSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(BooleanSchema().valueOf()).toEqual({
        type: 'boolean',
      })
    })
    it('from S', () => {
      expect(S.boolean().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'boolean',
      })
    })
  })

  it('sets a null type to the prop', () => {
    expect(
      S.object()
        .prop('prop', S.boolean())
        .valueOf().properties.prop.type
    ).toEqual('boolean')
  })
})
