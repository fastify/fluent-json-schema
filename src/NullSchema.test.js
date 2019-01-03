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
          .null()
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
        .object()
        .prop('prop', FluentSchema().null())
        .valueOf().properties.prop.type
    ).toEqual('null')
  })
})
