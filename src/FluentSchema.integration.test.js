'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const Ajv = require('ajv')

const basic = require('./schemas/basic')
const S = require('./FluentJSONSchema')

// TODO pick some ideas from here: https://github.com/json-schema-org/JSON-Schema-Test-Suite/tree/main/tests/draft7

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

  describe('combining keywords', () => {
    describe('allOf inside parent', () => {
      const ajv = new Ajv()
      const schema = S.object()
        .prop('parent', S.object()
          .prop('name', S.string().enum(['foo', 'bar']).required())
          .prop('index', S.number().required())
          .allOf([
            S.ifThen(
              S.object().prop('name', S.const('foo')),
              S.object().prop('index', S.const(0))
            ),
            S.ifThen(
              S.object().prop('name', S.const('bar')),
              S.object().prop('index', S.const(1))
            )
          ])
        ).required()
        .valueOf()

      const schemaObject = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            allOf: [
              {
                if: {
                  properties: {
                    name: {
                      $id: undefined,
                      const: 'foo',
                    }
                  }
                },
                then: {
                  properties: {
                    index: {
                      $id: undefined,
                      const: 0,
                    }
                  }
                }
              },
              {
                if: {
                  properties: {
                    name: {
                      $id: undefined,
                      const: 'bar'
                    }
                  }
                },
                then: {
                  properties: {
                    index: {
                      $id: undefined,
                      const: 1,
                    }
                  }
                }
              }
            ],
            properties: {
              index: { type: 'number', $id: undefined },
              name: {
                type: 'string',
                enum: ['foo', 'bar'],
                $id: undefined
              }
            },
            required: ['name', 'index'],
          }
        },
        required: ['parent'],
      }

      const validate = ajv.compile(schema)

      it('has expected types', () => {
        assert.strictEqual(schema.type, 'object')
        assert.strictEqual(schema.properties.parent.type, 'object')
        assert.strictEqual(schema.properties.parent.properties.index.type, 'number')
        assert.strictEqual(schema.properties.parent.properties.name.type, 'string')
      })

      it('matches', () => {
        assert.deepStrictEqual(schema, schemaObject)
      })

      it('creates matching with raw', () => {
        const rawSchema = S.raw(schemaObject)
        assert.deepStrictEqual(schema, rawSchema.valueOf())
      })

      it('valid foo', () => {
        const valid = validate({
          parent: { name: 'foo', index: 0 },
        })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('valid bar', () => {
        const valid = validate({
          parent: { name: 'bar', index: 1 },
        })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('invalid baz', () => {
        const valid = validate({
          parent: { name: 'baz', index: 2 },
        })
        assert.deepStrictEqual(validate.errors,
          [
            {
              instancePath: '/parent/name',
              keyword: 'enum',
              message: 'must be equal to one of the allowed values',
              params: {
                allowedValues: [
                  'foo',
                  'bar'
                ]
              },
              schemaPath: '#/properties/parent/properties/name/enum'
            }
          ]
        )
        assert.ok(!valid)
      })
    })

    describe('anyOf fizzbuzz', () => {
      const ajv = new Ajv({ strict: true })
      const schema = S.object()
        .prop('parent', S.object()
          .prop('fizzbuzz',
            S.allOf([
              S.anyOf([
                S.integer().multipleOf(3),
                S.integer().multipleOf(5),
                S.string().enum(['fizz', 'buzz'])
              ]),
              S.not(S.anyOf([
                S.integer().multipleOf(15),
                S.string().const('fizzbuzz')
              ]))
            ])
          ).required()
        ).required()
        .valueOf()

      const schemaObject = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            properties: {
              fizzbuzz: {
                $id: undefined,
                allOf: [
                  {
                    anyOf: [
                      {
                        type: 'integer',
                        multipleOf: 3
                      },
                      {
                        type: 'integer',
                        multipleOf: 5
                      },
                      {
                        type: 'string',
                        enum: [
                          'fizz',
                          'buzz'
                        ]
                      }
                    ]
                  },
                  {
                    not: {
                      anyOf: [
                        {
                          type: 'integer',
                          multipleOf: 15
                        },
                        {
                          type: 'string',
                          const: 'fizzbuzz'
                        }
                      ]
                    }
                  }
                ]
              }
            },
            required: [
              'fizzbuzz'
            ]
          }
        },
        required: [
          'parent'
        ]
      }

      const validate = ajv.compile(schema)

      it('has expected types', () => {
        assert.strictEqual(schema.type, 'object')
        assert.strictEqual(schema.properties.parent.type, 'object')
        assert.strictEqual(schema.properties.parent.properties.fizzbuzz.type, undefined)
      })

      it('matches', () => {
        assert.deepStrictEqual(schema, schemaObject)
      })

      it('creates matching with raw', () => {
        const rawSchema = S.raw(schemaObject)
        assert.deepStrictEqual(schema, rawSchema.valueOf())
      })

      it('valid string', () => {
        const validFizz = validate({
          parent: { fizzbuzz: 'fizz' },
        })
        assert.strictEqual(validate.errors, null)
        assert.ok(validFizz)

        const validBuzz = validate({
          parent: { fizzbuzz: 'buzz' },
        })
        assert.strictEqual(validate.errors, null)
        assert.ok(validBuzz)
      })

      it('invalid string', () => {
        const valid = validate({
          parent: { fizzbuzz: 'fizzbuzz' },
        })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/fizzbuzz',
            keyword: 'type',
            message: 'must be integer',
            params: {
              type: 'integer'
            },
            schemaPath: '#/properties/parent/properties/fizzbuzz/allOf/0/anyOf/0/type'
          },
          {
            instancePath: '/parent/fizzbuzz',
            keyword: 'type',
            message: 'must be integer',
            params: {
              type: 'integer'
            },
            schemaPath: '#/properties/parent/properties/fizzbuzz/allOf/0/anyOf/1/type'
          },
          {
            instancePath: '/parent/fizzbuzz',
            keyword: 'enum',
            message: 'must be equal to one of the allowed values',
            params: {
              allowedValues: [
                'fizz',
                'buzz'
              ]
            },
            schemaPath: '#/properties/parent/properties/fizzbuzz/allOf/0/anyOf/2/enum'
          },
          {
            instancePath: '/parent/fizzbuzz',
            keyword: 'anyOf',
            message: 'must match a schema in anyOf',
            params: {},
            schemaPath: '#/properties/parent/properties/fizzbuzz/allOf/0/anyOf'
          }
        ])
        assert.ok(!valid)
      })

      it('valid 3s', () => {
        for (let num = 3; num <= 12; num += 3) {
          const valid = validate({
            parent: { fizzbuzz: num },
          })
          assert.strictEqual(validate.errors, null)
          assert.ok(valid)
        }
      })

      it('valid 5s', () => {
        for (let num = 5; num <= 10; num += 5) {
          const valid = validate({
            parent: { fizzbuzz: num },
          })
          assert.strictEqual(validate.errors, null)
          assert.ok(valid)
        }
      })

      it('invalid 15', () => {
        const valid = validate({
          parent: { fizzbuzz: 15 },
        })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/fizzbuzz',
            keyword: 'not',
            message: 'must NOT be valid',
            params: {},
            schemaPath: '#/properties/parent/properties/fizzbuzz/allOf/1/not'
          }
        ])
        assert.ok(!valid)
      })
    })

    describe('allOf string type', () => {
      const ajv = new Ajv()
      const schema = S.object()
        .prop('parent', S.object()
          .prop('foo',
            S.string()
              .allOf([
                S.string().minLength(3),
                S.string().maxLength(5),
                S.string().pattern(/^a|z$/)
              ])
          ))
        .required()
        .valueOf()

      const schemaObject = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            properties: {
              foo: {
                type: 'string',
                allOf: [
                  {
                    type: 'string',
                    minLength: 3
                  },
                  {
                    type: 'string',
                    maxLength: 5
                  },
                  {
                    type: 'string',
                    pattern: '^a|z$'
                  }
                ],
                $id: undefined
              }
            }
          }
        },
        required: [
          'parent'
        ]
      }

      const validate = ajv.compile(schema)

      it('has expected types', () => {
        assert.strictEqual(schema.type, 'object')
        assert.strictEqual(schema.properties.parent.type, 'object')
        assert.strictEqual(schema.properties.parent.properties.foo.type, 'string')
      })

      it('matches', () => {
        assert.deepStrictEqual(schema, schemaObject)
      })

      it('creates matching with raw', () => {
        const rawSchema = S.raw(schemaObject)
        assert.deepStrictEqual(schema, rawSchema.valueOf())
      })

      it('valid', () => {
        const valid = validate({ parent: { foo: 'abc' } })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('invalid regex', () => {
        const valid = validate({ parent: { foo: '123' } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'pattern',
            message: 'must match pattern "^a|z$"',
            params: { pattern: '^a|z$' },
            schemaPath: '#/properties/parent/properties/foo/allOf/2/pattern'
          }
        ])
        assert.ok(!valid)
      })

      it('invalid too short', () => {
        const valid = validate({ parent: { foo: 'z' } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'minLength',
            message: 'must NOT have fewer than 3 characters',
            params: { limit: 3 },
            schemaPath: '#/properties/parent/properties/foo/allOf/0/minLength'
          }
        ])
        assert.ok(!valid)
      })

      it('invalid too long', () => {
        const valid = validate({ parent: { foo: 'a12345' } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'maxLength',
            message: 'must NOT have more than 5 characters',
            params: { limit: 5 },
            schemaPath: '#/properties/parent/properties/foo/allOf/1/maxLength'
          }
        ])
        assert.ok(!valid)
      })
    })

    describe('oneOf multiple types', () => {
      const ajv = new Ajv()
      const schema = S.object()
        .prop(
          'parent', S.object().prop('foo',
            S
              .oneOf([
                S.integer().multipleOf(9),
                S.number(),
                S.anyOf([
                  S.array().items(S.string()),
                  S.enum(['a', 'b', 'c'])
                ]),
              ])).required()
        ).required()
        .valueOf()

      const schemaObject = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          parent: {
            type: 'object',
            properties: {
              foo: {
                oneOf: [
                  {
                    multipleOf: 9,
                    type: 'integer'
                  },
                  {
                    type: 'number',
                  },
                  {
                    anyOf: [
                      {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      {
                        enum: [
                          'a',
                          'b',
                          'c'
                        ]
                      }
                    ]
                  }
                ],
                $id: undefined
              }
            },
            required: [
              'foo'
            ]
          }
        },
        required: [
          'parent'
        ]
      }

      const validate = ajv.compile(schema)

      it('has expected types', () => {
        assert.strictEqual(schema.type, 'object')
        assert.strictEqual(schema.properties.parent.type, 'object')
        assert.strictEqual(schema.properties.parent.properties.foo.type, undefined)
      })

      it('matches', () => {
        assert.deepStrictEqual(schema, schemaObject)
      })

      it('creates matching with raw', () => {
        const rawSchema = S.raw(schemaObject)
        assert.deepStrictEqual(schema, rawSchema.valueOf())
      })

      it('valid number', () => {
        const valid = validate({ parent: { foo: 10 } })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('valid string', () => {
        const valid = validate({ parent: { foo: 'a' } })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('valid array', () => {
        const valid = validate({ parent: { foo: ['bar'] } })
        assert.strictEqual(validate.errors, null)
        assert.ok(valid)
      })

      it('invalid number', () => {
        const valid = validate({ parent: { foo: 9 } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'oneOf',
            message: 'must match exactly one schema in oneOf',
            params: {
              passingSchemas: [0, 1]
            },
            schemaPath: '#/properties/parent/properties/foo/oneOf'
          }
        ])
        assert.ok(!valid)
      })

      it('invalid string', () => {
        const valid = validate({ parent: { foo: 'bar' } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be integer',
            params: { type: 'integer' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/0/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be number',
            params: { type: 'number' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/1/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be array',
            params: { type: 'array' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf/0/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'enum',
            message: 'must be equal to one of the allowed values',
            params: { allowedValues: ['a', 'b', 'c'] },
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf/1/enum'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'anyOf',
            message: 'must match a schema in anyOf',
            params: {},
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'oneOf',
            message: 'must match exactly one schema in oneOf',
            params: { passingSchemas: null },
            schemaPath: '#/properties/parent/properties/foo/oneOf'
          }
        ])
        assert.ok(!valid)
      })

      it('invalid type', () => {
        const valid = validate({ parent: { foo: {} } })
        assert.deepStrictEqual(validate.errors, [
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be integer',
            params: { type: 'integer' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/0/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be number',
            params: { type: 'number' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/1/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'type',
            message: 'must be array',
            params: { type: 'array' },
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf/0/type'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'enum',
            message: 'must be equal to one of the allowed values',
            params: { allowedValues: ['a', 'b', 'c'] },
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf/1/enum'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'anyOf',
            message: 'must match a schema in anyOf',
            params: {},
            schemaPath: '#/properties/parent/properties/foo/oneOf/2/anyOf'
          },
          {
            instancePath: '/parent/foo',
            keyword: 'oneOf',
            message: 'must match exactly one schema in oneOf',
            params: { passingSchemas: null },
            schemaPath: '#/properties/parent/properties/foo/oneOf'
          }
        ])
        assert.ok(!valid)
      })
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
