const { FluentSchema } = require('./FluentSchema')

describe('FluentSchema', () => {
  describe('defaults', () => {
    it('is defined', () => {
      expect(FluentSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {},
        properties: {},
        required: [],
        type: 'object',
      })
    })
  })

  describe('prop', () => {
    it('sets a prop with type string', () => {
      expect(
        FluentSchema()
          .prop('prop')
          .valueOf().properties
      ).toEqual({
        prop: {
          type: 'string',
          $id: '#properties/prop',
        },
      })
    })

    it('sets a prop with a nested object', () => {
      expect(
        FluentSchema()
          .prop('foo', FluentSchema().prop('bar'))
          .valueOf().properties.foo.properties
      ).toEqual({
        bar: {
          $id: '#properties/bar',
          type: 'string',
        },
      })
    })

    it('sets a prop with a $ref', () => {
      expect(
        FluentSchema()
          .definition(
            'foo',
            FluentSchema()
              .prop('foo')
              .prop('bar')
          )
          .prop('prop')
          .ref('#definition/foo')
          .valueOf().properties
      ).toEqual({ prop: { $ref: '#definition/foo' } })
    })
  })

  describe('definition', () => {
    it('sets a definition', () => {
      expect(
        FluentSchema()
          .definition(
            'foo',
            FluentSchema()
              .prop('foo')
              .prop('bar')
          )
          .valueOf().definitions
      ).toEqual({
        foo: {
          $id: '#definitions/foo',
          type: 'object',
          properties: {
            foo: {
              $id: '#properties/foo',
              type: 'string',
            },
            bar: {
              $id: '#properties/bar',
              type: 'string',
            },
          },
          required: [],
        },
      })
    })
  })

  describe('asNumber', () => {
    it('returns a type to the root schema', () => {
      expect(
        FluentSchema()
          .asNumber()
          .valueOf().type
      ).toEqual('number')
    })

    it('returns a type to the root schema', () => {
      expect(
        FluentSchema()
          .prop('value')
          .asNumber()
          .valueOf().properties.value.type
      ).toEqual('number')
    })
  })

  describe('asObject', () => {
    it('sets a type object to the root', () => {
      expect(
        FluentSchema()
          .asObject()
          .valueOf().type
      ).toEqual('object')
    })

    it('sets a type object to the prop', () => {
      expect(
        FluentSchema()
          .prop('value')
          .asObject()
          .valueOf().properties.value.type
      ).toEqual('object')
    })
  })

  describe('anyOf', () => {
    it('sets two alternative', () => {
      expect(
        FluentSchema()
          .prop('gender')
          .anyOf(
            FluentSchema()
              .prop('male')
              .prop('female')
          )
          .valueOf()
      ).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {},
        properties: {
          gender: {
            $id: '#properties/gender',
            anyOf: [
              { $id: '#properties/male', type: 'string' },
              { $id: '#properties/female', type: 'string' },
            ],
          },
        },
        required: [],
        type: 'object',
      })
    })
  })

  it('works', () => {
    // TODO LS https://json-schema.org/latest/json-schema-core.html#idExamples
    const schema = FluentSchema()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .definition(
        'address',
        FluentSchema()
          .prop('country')
          .prop('city')
          .prop('zipcode')
      )
      .prop('username')
      .required()
      .prop('password')
      .required()
      .prop('address')
      .ref('#definitions/address')
      .required()
      .prop(
        'role',
        FluentSchema()
          .id('http://foo.com/role')
          .prop('name')
          .prop('permissions')
      )
      .required()
      .prop('age')
      .asNumber()
      .valueOf()

    //console.log(JSON.stringify(schema))
    expect(schema).toEqual({
      definitions: {
        address: {
          type: 'object',
          $id: '#definitions/address',
          properties: {
            country: {
              type: 'string',
              $id: '#properties/country',
            },
            city: {
              type: 'string',
              $id: '#properties/city',
            },
            zipcode: {
              type: 'string',
              $id: '#properties/zipcode',
            },
          },
          required: [],
        },
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['username', 'password', 'address', 'role'],
      $id: 'http://foo.com/user',
      title: 'A User',
      description: 'A User desc',
      properties: {
        username: {
          type: 'string',
          $id: '#properties/username',
        },
        password: {
          type: 'string',
          $id: '#properties/password',
        },
        address: {
          $ref: '#definitions/address',
        },
        age: {
          $id: '#properties/age',
          type: 'number',
        },
        role: {
          type: 'object',
          $id: 'http://foo.com/role',
          properties: {
            name: {
              type: 'string',
              $id: '#properties/name',
            },
            permissions: {
              type: 'string',
              $id: '#properties/permissions',
            },
          },
          required: [],
        },
      },
    })
  })
})
