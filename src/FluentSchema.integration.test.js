'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const Ajv = require('ajv')

const basic = require('./schemas/basic')
const S = require('./FluentJSONSchema')

// TODO pick some ideas from here:https://github.com/json-schema-org/JSON-Schema-Test-Suite/tree/master/tests/draft7

describe('S', () => {
  it('compiles', () => {
    const ajv = new Ajv()
    const schema = S.valueOf()
    const validate = ajv.compile(schema)
    const valid = validate({})
    assert.ok(valid)
  })

  describe('basic', () => {
    const ajv = new Ajv()
    const schema = S.object()
      .prop('username', S.string())
      .prop('password', S.string())
      .valueOf()
    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        username: 'username',
        password: 'password'
      })
      assert.ok(valid)
    })

    it('invalid', () => {
      const valid = validate({
        username: 'username',
        password: 1
      })
      assert.deepStrictEqual(validate.errors, [
        {
          instancePath: '/password',
          keyword: 'type',
          message: 'must be string',
          params: { type: 'string' },
          schemaPath: '#/properties/password/type'
        }
      ])
      assert.ok(!valid)
    })
  })

  describe('ifThen', () => {
    const ajv = new Ajv()
    const schema = S.object()
      .prop('prop', S.string().maxLength(5))
      .ifThen(
        S.object().prop('prop', S.string().maxLength(5)),
        S.object().prop('extraProp', S.string()).required()
      )
      .valueOf()
    const validate = ajv.compile(schema)

    it('valid', () => {
      const valid = validate({
        prop: '12345',
        extraProp: 'foo'
      })
      assert.ok(valid)
    })

    it('invalid', () => {
      const valid = validate({
        prop: '12345'
      })
      assert.deepStrictEqual(validate.errors, [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'extraProp'",
          params: { missingProperty: 'extraProp' },
          schemaPath: '#/then/required'
        }
      ])
      assert.ok(!valid)
    })
  })

  describe('ifThenElse', () => {
    const ajv = new Ajv()

    const VALUES = ['ONE', 'TWO']
    const schema = S.object()
      .prop('ifProp')
      .ifThenElse(
        S.object().prop('ifProp', S.string().enum([VALUES[0]])),
        S.object().prop('thenProp', S.string()).required(),
        S.object().prop('elseProp', S.string()).required()
      )
      .valueOf()

    const validate = ajv.compile(schema)

    it('then', () => {
      const valid = validate({
        ifProp: 'ONE',
        thenProp: 'foo'
      })
      assert.ok(valid)
    })

    it('else', () => {
      const valid = validate({
        prop: '123456'
      })
      assert.deepStrictEqual(validate.errors, [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'thenProp'",
          params: { missingProperty: 'thenProp' },
          schemaPath: '#/then/required'
        }
      ])
      assert.ok(!valid)
    })
  })

  describe('combine and definition', () => {
    const ajv = new Ajv()
    const schema = S.object() // FIXME LS it shouldn't be object()
      .definition(
        'address',
        S.object()
          .id('#/definitions/address')
          .prop('street_address', S.string())
          .required()
          .prop('city', S.string())
          .required()
          .prop('state', S.string().required())
      )
      .allOf([
        S.ref('#/definitions/address'),
        S.object().prop('type', S.string()).enum(['residential', 'business'])
      ])
      .valueOf()
    const validate = ajv.compile(schema)
    it('matches', () => {
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        definitions: {
          address: {
            $id: '#/definitions/address',
            type: 'object',
            properties: {
              street_address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' }
            },
            required: ['street_address', 'city', 'state']
          }
        },
        allOf: [
          { $ref: '#/definitions/address' },
          {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['residential', 'business'] }
            }
          }
        ]
      })
    })

    it('valid', () => {
      const valid = validate({
        street_address: 'via Paolo Rossi',
        city: 'Topolinia',
        state: 'Disney World',
        type: 'business'
      })
      assert.strictEqual(validate.errors, null)
      assert.ok(valid)
    })
  })

  // https://github.com/fastify/fluent-json-schema/pull/40
  describe('cloning objects retains boolean', () => {
    const ajv = new Ajv()
    const config = {
      schema: S.object().prop('foo', S.string().enum(['foo']))
    }
    const _config = require('lodash.merge')({}, config)
    const schema = _config.schema.valueOf()
    const validate = ajv.compile(schema)
    it('matches', () => {
      assert.notStrictEqual(
        config.schema[Symbol.for('fluent-schema-object')],
        undefined
      )
      assert.ok(_config.schema.isFluentJSONSchema)
      assert.strictEqual(
        _config.schema[Symbol.for('fluent-schema-object')],
        undefined
      )
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            enum: ['foo']
          }
        }
      })
    })

    it('valid', () => {
      const valid = validate({ foo: 'foo' })
      assert.strictEqual(validate.errors, null)
      assert.ok(valid)
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
        anotherProp: true
      })
      assert.ok(valid)
    })

    it('invalid', () => {
      const valid = validate({
        foo: 'foo',
        bar: 1
      })
      assert.ok(!valid)
    })
  })

  describe('compose ifThen', () => {
    const ajv = new Ajv()
    const schema = S.object()
      .prop('foo', S.string().default(false).required())
      .prop('bar', S.string().default(false).required())
      .prop('thenFooA', S.string())
      .prop('thenFooB', S.string())
      .allOf([
        S.ifThen(
          S.object().prop('foo', S.string()).enum(['foo']),
          S.required(['thenFooA', 'thenFooB'])
        ),
        S.ifThen(
          S.object().prop('bar', S.string()).enum(['BAR']),
          S.required(['thenBarA', 'thenBarB'])
        )
      ])
      .valueOf()

    const validate = ajv.compile(schema)
    it('matches', () => {
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                foo: { $id: undefined, enum: ['foo'], type: 'string' }
              }
            },
            then: { required: ['thenFooA', 'thenFooB'] }
          },
          {
            if: {
              properties: {
                bar: { $id: undefined, enum: ['BAR'], type: 'string' }
              }
            },
            then: { required: ['thenBarA', 'thenBarB'] }
          }
        ],
        properties: {
          bar: { default: false, type: 'string' },
          foo: { default: false, type: 'string' },
          thenFooA: { type: 'string' },
          thenFooB: { type: 'string' }
        },
        required: ['foo', 'bar'],
        type: 'object'
      })
    })

    it('valid', () => {
      const valid = validate({
        foo: 'foo',
        thenFooA: 'thenFooA',
        thenFooB: 'thenFooB',
        bar: 'BAR',
        thenBarA: 'thenBarA',
        thenBarB: 'thenBarB'
      })
      assert.strictEqual(validate.errors, null)
      assert.ok(valid)
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
          .prop('country', S.string())
          .prop('city', S.string())
          .prop('zipcode', S.string())
      )
      .prop('username', S.string())
      .required()
      .prop('password', S.string().required())
      .prop('address', S.object().ref('#address'))

      .required()
      .prop(
        'role',
        S.object()
          .id('http://foo.com/role')
          .required()
          .prop('name', S.string())
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
          zipcode: '20100'
        },
        role: {
          name: 'admin',
          permissions: 'read:write'
        },
        age: 30
      })
      assert.ok(valid)
    })

    describe('invalid', () => {
      const model = {
        username: 'aboutlo',
        password: 'pswd',
        address: {
          country: 'Italy',
          city: 'Milan',
          zipcode: '20100'
        },
        role: {
          name: 'admin',
          permissions: 'read:write'
        },
        age: 30
      }
      it('password', () => {
        const { password, ...data } = model
        const valid = validate(data)
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'password'",
            params: { missingProperty: 'password' },
            schemaPath: '#/required'
          }
        ])
        assert.ok(!valid)
      })
      it('address', () => {
        const { address, ...data } = model
        const valid = validate({
          ...data,
          address: {
            ...address,
            city: 1234
          }
        })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/address/city',
            keyword: 'type',
            message: 'must be string',
            params: { type: 'string' },
            schemaPath: '#address/properties/city/type'
          }
        ])
        assert.ok(!valid)
      })
    })
  })

  describe('basic.json', () => {
    it('generate', () => {
      const [step] = basic
      assert.deepStrictEqual(
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
              .prop('name', S.string())
              .required()
              .prop('price', S.number().exclusiveMinimum(0).required())
              .prop(
                'tags',
                S.array().items(S.string()).minItems(1).uniqueItems(true)
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
          .valueOf(),
        {
          ...step.schema,
          items: {
            ...step.schema.items,
            properties: {
              ...step.schema.items.properties,
              dimensions: {
                ...step.schema.items.properties.dimensions,
                properties: {
                  length: { $id: undefined, type: 'number' },
                  width: { $id: undefined, type: 'number' },
                  height: { $id: undefined, type: 'number' }
                }
              }
            }
          }
        }
      )
    })
  })

  describe('raw', () => {
    describe('swaggger', () => {
      describe('nullable', () => {
        it('allows nullable', () => {
          const ajv = new Ajv()
          const schema = S.object()
            .prop('foo', S.raw({ nullable: true, type: 'string' }))
            .valueOf()
          const validate = ajv.compile(schema)
          const valid = validate({
            test: null
          })
          assert.strictEqual(validate.errors, null)
          assert.ok(valid)
        })
      })
    })

    describe('ajv', () => {
      describe('formatMaximum', () => {
        it('checks custom keyword formatMaximum', () => {
          const ajv = new Ajv()
          require('ajv-formats')(ajv)
          /*        const schema = S.string()
            .raw({ nullable: false })
            .valueOf() */
          // { type: 'number', nullable: true }
          const schema = S.object()
            .prop(
              'birthday',
              S.raw({
                format: 'date',
                formatMaximum: '2020-01-01',
                type: 'string'
              })
            )
            .valueOf()

          const validate = ajv.compile(schema)
          const valid = validate({
            birthday: '2030-01-01'
          })
          assert.deepStrictEqual(validate.errors, [
            {
              instancePath: '/birthday',
              keyword: 'formatMaximum',
              message: 'should be <= 2020-01-01',
              params: {
                comparison: '<=',
                limit: '2020-01-01'
              },
              schemaPath: '#/properties/birthday/formatMaximum'
            }
          ])
          assert.ok(!valid)
        })
        it('checks custom keyword larger with $data', () => {
          const ajv = new Ajv({ $data: true })
          require('ajv-formats')(ajv)
          /*        const schema = S.string()
            .raw({ nullable: false })
            .valueOf() */
          // { type: 'number', nullable: true }
          const schema = S.object()
            .prop('smaller', S.number().raw({ maximum: { $data: '1/larger' } }))
            .prop('larger', S.number())
            .valueOf()

          const validate = ajv.compile(schema)
          const valid = validate({
            smaller: 10,
            larger: 7
          })
          assert.deepStrictEqual(validate.errors, [
            {
              instancePath: '/smaller',
              keyword: 'maximum',
              message: 'must be <= 7',
              params: {
                comparison: '<=',
                limit: 7
              },
              schemaPath: '#/properties/smaller/maximum'
            }
          ])
          assert.ok(!valid)
        })
      })
    })
  })
})
