const { NullSchema } = require('./NullSchema')
const S = require('./FluentSchema')

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
})
