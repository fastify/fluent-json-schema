const { BooleanSchema } = require('./BooleanSchema')
const { FluentSchema } = require('./FluentSchema')

describe('BooleanSchema', () => {
  it('defined', () => {
    expect(BooleanSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(BooleanSchema().valueOf()).toEqual({
        type: 'boolean',
      })
    })
    it('from FluentSchema', () => {
      expect(
        FluentSchema()
          .asBoolean()
          .valueOf()
      ).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'boolean',
      })
    })
  })

  it('sets a null type to the prop', () => {
    expect(
      FluentSchema()
        .asObject()
        .prop('prop', FluentSchema().asBoolean())
        .valueOf().properties.prop.type
    ).toEqual('boolean')
  })
})
