const { setRaw } = require('./utils')
const { StringSchema } = require('./StringSchema')
const { ObjectSchema } = require('./ObjectSchema')

describe('setRaw', () => {
  it('add an attribute to a prop using ObjectSchema', () => {
    const factory = ObjectSchema
    const schema = setRaw(
      { schema: { properties: [{ name: 'foo', type: 'string' }] }, factory },
      { nullable: true }
    )
    expect(schema.valueOf()).toEqual({
      properties: {
        foo: {
          nullable: true,
          type: 'string',
        },
      },
    })
  })

  it('add an attribute to a prop using StringSchema', () => {
    const factory = StringSchema
    const schema = setRaw(
      { schema: { type: 'string', properties: [] }, factory },
      { nullable: true }
    )
    expect(schema.valueOf()).toEqual({
      nullable: true,
      type: 'string',
    })
  })
})
