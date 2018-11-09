const { FluentSchema } = require('./FluentSchema')
const Ajv = require('ajv')

describe('FluentSchema', () => {
  it('compiles', () => {
    const ajv = new Ajv()
    const schema = FluentSchema().valueOf()
    const validate = ajv.compile(schema)
    var valid = validate({})
    expect(valid).toBeTruthy()
  })

  describe('basic', () => {
    const ajv = new Ajv()
    const schema = FluentSchema()
      .prop('username')
      .prop('password')
      .valueOf()
    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        username: 'username',
        password: 'password',
      })
      expect(valid).toBeTruthy()
    })

    it('invalid', () => {
      var valid = validate({
        username: 'username',
        password: 1,
      })
      expect(validate.errors).toEqual([
        {
          dataPath: '.password',
          keyword: 'type',
          message: 'should be string',
          params: { type: 'string' },
          schemaPath: '#/properties/password/type',
        },
      ])
      expect(valid).not.toBeTruthy()
    })
  })

  describe('complex', () => {
    const ajv = new Ajv()
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
    const validate = ajv.compile(schema)
    it('valid', () => {
      const valid = validate({
        username: 'aboutlo',
        password: 'pwsd',
        address: {
          country: 'Italy',
          city: 'Milan',
          zipcode: '20100',
        },
        role: {
          name: 'admin',
          permissions: 'read:write',
        },
        age: 30,
      })
      expect(valid).toBeTruthy()
    })

    describe('invalid', () => {
      const model = {
        username: 'aboutlo',
        password: 'pswd',
        address: {
          country: 'Italy',
          city: 'Milan',
          zipcode: '20100',
        },
        role: {
          name: 'admin',
          permissions: 'read:write',
        },
        age: 30,
      }
      it('password', () => {
        const { password, ...data } = model
        const valid = validate(data)
        expect(validate.errors).toEqual([
          {
            dataPath: '',
            keyword: 'required',
            message: "should have required property 'password'",
            params: { missingProperty: 'password' },
            schemaPath: '#/required',
          },
        ])
        expect(valid).not.toBeTruthy()
      })
      it('address', () => {
        const { address, ...data } = model
        const valid = validate({
          ...data,
          address: {
            ...address,
            city: 1234,
          },
        })
        expect(validate.errors).toEqual([
          {
            dataPath: '.address.city',
            keyword: 'type',
            message: 'should be string',
            params: { type: 'string' },
            schemaPath: '#definitions/address/properties/city/type',
          },
        ])
        expect(valid).not.toBeTruthy()
      })
    })
  })
})
