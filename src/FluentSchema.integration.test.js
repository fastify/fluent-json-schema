const basic = require('./schemas/basic')
const { FluentSchema, FORMATS } = require('./FluentSchema')
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
      .object()
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
      .object()
      .prop(
        'prop',
        FluentSchema()
          .string()
          .maxLength(5)
      )
      .ifThen(
        FluentSchema()
          .object()
          .prop(
            'prop',
            FluentSchema()
              .string()
              .maxLength(5)
          ),
        FluentSchema()
          .object()
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
      .object()
      .prop('ifProp')
      .ifThenElse(
        FluentSchema()
          .object()
          .prop(
            'ifProp',
            FluentSchema()
              .string()
              .enum([VALUES[0]])
          ),
        FluentSchema()
          .object()
          .prop('thenProp')
          .required(),
        FluentSchema()
          .object()
          .prop('elseProp')
          .required()
      )
      .valueOf()

    const validate = ajv.compile(schema)

    it('then', () => {
      const valid = validate({
        ifProp: 'ONE',
        thenProp: 'foo',
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
          message: "should have required property 'thenProp'",
          params: { missingProperty: 'thenProp' },
          schemaPath: '#/then/required',
        },
      ])
      expect(valid).not.toBeTruthy()
    })
  })

  describe('combine and definition', () => {
    const ajv = new Ajv()
    const schema = FluentSchema()
      .object() //FIXME LS it shouldn't be object()
      .definition(
        'address',
        FluentSchema()
          .object()
          .id('#/definitions/address')
          .prop('street_address')
          .required()
          .prop('city')
          .required()
          .prop('state')
          .required()
      )
      .allOf([
        FluentSchema().ref('#/definitions/address'),
        FluentSchema()
          .object()
          .prop('type')
          .enum(['residential', 'business']),
      ])
      .valueOf()
    const validate = ajv.compile(schema)
    it('matches', () => {
      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        definitions: {
          address: {
            $id: '#/definitions/address',
            type: 'object',
            properties: {
              street_address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
            },
            required: ['street_address', 'city', 'state'],
          },
        },
        allOf: [
          { $ref: '#/definitions/address' },
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['residential', 'business'] },
            },
          },
        ],
      })
    })

    it('valid', () => {
      const valid = validate({
        street_address: 'via Paolo Rossi',
        city: 'Topolinia',
        state: 'Disney World',
        type: 'business',
      })
      expect(validate.errors).toEqual(null)
      expect(valid).toBeTruthy()
    })
  })

  describe('compose keywords', () => {
    const ajv = new Ajv()
    const schema = FluentSchema()
      .object()
      .prop('foo', FluentSchema().anyOf([FluentSchema().string()]))
      .prop(
        'bar',
        FluentSchema().not(FluentSchema().anyOf([FluentSchema().integer()]))
      )
      .prop(
        'prop',
        FluentSchema().allOf([
          FluentSchema().string(),
          FluentSchema().boolean(),
        ])
      )
      .prop(
        'anotherProp',
        FluentSchema().oneOf([
          FluentSchema().string(),
          FluentSchema().boolean(),
        ])
      )
      .required()
      .valueOf()

    // console.log(JSON.stringify(schema, null, 2))
    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        foo: 'foo',
        anotherProp: true,
      })
      // console.log(validate.errors)
      expect(valid).toBeTruthy()
    })

    it('invalid', () => {
      const valid = validate({
        foo: 'foo',
        bar: 1,
      })
      expect(valid).toBeFalsy()
    })
  })

  describe('complex', () => {
    const ajv = new Ajv()
    const schema = FluentSchema()
      .object()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .definition(
        'address',
        FluentSchema()
          .object()
          .id('#address')
          .prop('country')
          .prop('city')
          .prop('zipcode')
      )
      .prop('username')
      .required()
      .prop(
        'password',
        FluentSchema()
          .string()
          .required()
      )
      .prop(
        'address',
        FluentSchema()
          .object()
          .ref('#address')
      )

      .required()
      .prop(
        'role',
        FluentSchema()
          .object()
          .id('http://foo.com/role')
          .required()
          .prop('name')
          .prop('permissions')
      )
      .prop('age', FluentSchema().number())
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
            schemaPath: '#address/properties/city/type',
          },
        ])
        expect(valid).not.toBeTruthy()
      })
    })
  })

  describe('basic.json', () => {
    it('generate', () => {
      const [step] = basic
      expect(
        FluentSchema()
          .array()
          .title('Product set')
          .items(
            FluentSchema()
              .object()
              .title('Product')
              .prop(
                'uuid',
                FluentSchema()
                  .number()
                  .description('The unique identifier for a product')
                  .required()
              ) // TODO LS bug if we use `id` the property is removed by deepOmit
              .prop('name')
              .required()
              .prop(
                'price',
                FluentSchema()
                  .number()
                  .exclusiveMinimum(0)
                  .required()
              )
              .prop(
                'tags',
                FluentSchema()
                  .array()
                  .items(FluentSchema().string())
                  .minItems(1)
                  .uniqueItems(true)
              )

              .prop(
                'dimensions',
                FluentSchema()
                  .object()
                  .prop(
                    'length',
                    FluentSchema()
                      .number()
                      .required()
                  )

                  .prop(
                    'width',
                    FluentSchema()
                      .number()
                      .required()
                  )
                  .prop(
                    'height',
                    FluentSchema()
                      .number()
                      .required()
                  )
              )
              .prop(
                'warehouseLocation',
                FluentSchema()
                  .string()
                  .description('Coordinates of the warehouse with the product')
              )
          )
          .valueOf()
      ).toEqual(step.schema)
    })
  })
})
