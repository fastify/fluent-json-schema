const { NullSchema } = require('./NullSchema')
const { FluentSchema } = require('./FluentSchema')

describe('NullSchema', () => {
  it('defined', () => {
    expect(NullSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(NullSchema().valueOf()).toEqual({
        type: 'null',
      })
    })
    it('from FluentSchema', () => {
      expect(
        FluentSchema()
          .asNull()
          .valueOf()
      ).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'null',
      })
    })
  })

  it('sets a null type to the prop', () => {
    expect(
      FluentSchema()
        .asObject()
        .prop('prop', FluentSchema().asNull())
        .valueOf().properties.prop.type
    ).toEqual('null')
  })
})
