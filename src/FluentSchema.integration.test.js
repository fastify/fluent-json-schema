const basic = require('./schemas/basic')
const { deepOmit } = require('./utils')
const { FluentSchema } = require('./FluentSchema')
const Ajv = require('ajv')

// TODO pick some ideas from here:https://github.com/json-schema-org/JSON-Schema-Test-Suite/tree/master/tests/draft7

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

  describe('ifThen', () => {
    const ajv = new Ajv()
    const schema = FluentSchema()
      .prop('prop')
      .maxLength(5)
      .ifThen(
        FluentSchema()
          .prop('prop')
          .maxLength(5),
        FluentSchema()
          .prop('extraProp')
          .required()
      )
      .valueOf()
    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        prop: '12345',
        extraProp: 'foo',
      })
      expect(valid).toBeTruthy()
    })

    it('invalid', () => {
      const valid = validate({
        prop: '12345',
      })
      expect(validate.errors).toEqual([
        {
          dataPath: '',
          keyword: 'required',
          message: "should have required property 'extraProp'",
          params: { missingProperty: 'extraProp' },
          schemaPath: '#/then/required',
        },
      ])
      expect(valid).not.toBeTruthy()
    })
  })

  describe('ifThenElse', () => {
    const ajv = new Ajv()

    const VALUES = ['ONE', 'TWO']
    const schema = FluentSchema()
      .prop('prop')
      .ifThenElse(
        FluentSchema()
          .prop('prop')
          // TODO LS workaround otherwise we have dup IDs
          // .id('#properties/if/prop')
          .enum([VALUES[0]]),
        FluentSchema()
          .prop('extraProp')
          .required(),
        FluentSchema()
          .prop('elseProp')
          .required()
      )
      .valueOf()

    const validate = ajv.compile(schema)

    it('then', () => {
      const valid = validate({
        prop: 'ONE',
        extraProp: 'foo',
      })
      expect(valid).toBeTruthy()
    })

    it('else', () => {
      const valid = validate({
        prop: '123456',
      })
      expect(validate.errors).toEqual([
        {
          dataPath: '',
          keyword: 'required',
          message: "should have required property 'elseProp'",
          params: { missingProperty: 'elseProp' },
          schemaPath: '#/else/required',
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

  describe('basic.json', () => {
    it.only('generate', () => {
      const [step] = basic
      expect(
        deepOmit(
          FluentSchema()
            .asArray()
            .title('Product set')
            .items(
              FluentSchema()
                .title('Product')
                .prop('uuid') // TODO LS bug if we use `id` the property is removed by deepOmit
                .description('The unique identifier for a product')
                .asNumber()
                .required()
                .prop('name')
                .required()
                .prop('price')
                .asNumber()
                .exclusiveMinimum(0)
                .required()
                .prop('tags')
                .asArray()
                .items(FluentSchema().asString())
                .minItems(1)
                .uniqueItems(true)
                .prop(
                  'dimensions',
                  FluentSchema()
                    .prop('length')
                    .asNumber()
                    .required()
                    .prop('width')
                    .asNumber()
                    .required()
                    .prop('height')
                    .asNumber()
                    .required()
                )
                .prop('warehouseLocation')
                .description('Coordinates of the warehouse with the product')
            )
            .valueOf(),
          '$id'
        )
      ).toEqual(step.schema)
    })
  })
})
