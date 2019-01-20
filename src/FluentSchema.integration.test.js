const basic = require('./schemas/basic')
const S = require('./FluentSchema')
const Ajv = require('ajv')

// TODO pick some ideas from here:https://github.com/json-schema-org/JSON-Schema-Test-Suite/tree/master/tests/draft7

describe('S', () => {
  it('compiles', () => {
    const ajv = new Ajv()
    const schema = S.valueOf()
    const validate = ajv.compile(schema)
    var valid = validate({})
    expect(valid).toBeTruthy()
  })

  describe('basic', () => {
    const ajv = new Ajv()
    const schema = S.object()
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
    const schema = S.object()
      .prop('prop', S.string().maxLength(5))
      .ifThen(
        S.object().prop('prop', S.string().maxLength(5)),
        S.object()
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
    const schema = S.object()
      .prop('ifProp')
      .ifThenElse(
        S.object().prop('ifProp', S.string().enum([VALUES[0]])),
        S.object()
          .prop('thenProp')
          .required(),
        S.object()
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
    const schema = S.object() //FIXME LS it shouldn't be object()
      .definition(
        'address',
        S.object()
          .id('#/definitions/address')
          .prop('street_address')
          .required()
          .prop('city')
          .required()
          .prop('state')
          .required()
      )
      .allOf([
        S.ref('#/definitions/address'),
        S.object()
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
    const schema = S.object()
      .prop('foo', S.anyOf([S.string()]))
      .prop('bar', S.not(S.anyOf([S.integer()])))
      .prop('prop', S.allOf([S.string(), S.boolean()]))
      .prop('anotherProp', S.oneOf([S.string(), S.boolean()]))
      .required()
      .valueOf()

    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        foo: 'foo',
        anotherProp: true,
      })
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

  describe('compose ifThen', () => {
    const ajv = new Ajv()
    const schema = S.object()
      .prop(
        'foo',
        S.string()
          .default(false)
          .required()
      )
      .prop(
        'bar',
        S.string()
          .default(false)
          .required()
      )
      .prop('thenFooA')
      .prop('thenFooB')
      .allOf([
        S.ifThen(
          S.object()
            .prop('foo')
            .enum(['foo']),
          S.required(['thenFooA', 'thenFooB'])
        ),
        S.ifThen(
          S.object()
            .prop('bar')
            .enum(['BAR']),
          S.required(['thenBarA', 'thenBarB'])
        ),
      ])
      .valueOf()

    const validate = ajv.compile(schema)
    it('matches', () => {
      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                foo: { $id: undefined, enum: ['foo'], type: 'string' },
              },
            },
            then: { required: ['thenFooA', 'thenFooB'] },
          },
          {
            if: {
              properties: {
                bar: { $id: undefined, enum: ['BAR'], type: 'string' },
              },
            },
            then: { required: ['thenBarA', 'thenBarB'] },
          },
        ],
        properties: {
          bar: { default: false, type: 'string' },
          foo: { default: false, type: 'string' },
          thenFooA: { type: 'string' },
          thenFooB: { type: 'string' },
        },
        required: ['foo', 'bar'],
        type: 'object',
      })
    })

    it('valid', () => {
      const valid = validate({
        foo: 'foo',
        thenFooA: 'thenFooA',
        thenFooB: 'thenFooB',
        bar: 'BAR',
        thenBarA: 'thenBarA',
        thenBarB: 'thenBarB',
      })
      expect(validate.errors).toEqual(null)
      expect(valid).toBeTruthy()
    })
  })

  describe('complex', () => {
    const ajv = new Ajv()
    const schema = S.object()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .definition(
        'address',
        S.object()
          .id('#address')
          .prop('country')
          .prop('city')
          .prop('zipcode')
      )
      .prop('username')
      .required()
      .prop('password', S.string().required())
      .prop('address', S.object().ref('#address'))

      .required()
      .prop(
        'role',
        S.object()
          .id('http://foo.com/role')
          .required()
          .prop('name')
          .prop('permissions')
      )
      .prop('age', S.number())
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
        S.array()
          .title('Product set')
          .items(
            S.object()
              .title('Product')
              .prop(
                'uuid',
                S.number()
                  .description('The unique identifier for a product')
                  .required()
              )
              .prop('name')
              .required()
              .prop(
                'price',
                S.number()
                  .exclusiveMinimum(0)
                  .required()
              )
              .prop(
                'tags',
                S.array()
                  .items(S.string())
                  .minItems(1)
                  .uniqueItems(true)
              )

              .prop(
                'dimensions',
                S.object()
                  .prop('length', S.number().required())

                  .prop('width', S.number().required())
                  .prop('height', S.number().required())
              )
              .prop(
                'warehouseLocation',
                S.string().description(
                  'Coordinates of the warehouse with the product'
                )
              )
          )
          .valueOf()
      ).toEqual(step.schema)
    })
  })
})
