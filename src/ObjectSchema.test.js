'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { ObjectSchema } = require('./ObjectSchema')
const S = require('./FluentJSONSchema')

describe('ObjectSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(ObjectSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      ObjectSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(ObjectSchema().valueOf(), {
        // $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object'
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          assert.deepStrictEqual(
            ObjectSchema({ generateIds: true })
              .prop('prop', S.string())
              .valueOf(),
            {
              properties: { prop: { $id: '#properties/prop', type: 'string' } },
              type: 'object'
            }
          )
        })

        it('false', () => {
          assert.deepStrictEqual(ObjectSchema().prop('prop').valueOf(), {
            properties: { prop: {} },
            type: 'object'
          })
        })

        describe('nested', () => {
          it('true', () => {
            assert.deepStrictEqual(
              ObjectSchema({ generateIds: true })
                .prop('foo', ObjectSchema().prop('bar').required())
                .valueOf(),
              {
                properties: {
                  foo: {
                    $id: '#properties/foo',
                    properties: {
                      bar: {
                        $id: '#properties/foo/properties/bar'
                      }
                    },
                    required: ['bar'],
                    type: 'object'
                  }
                },
                type: 'object'
              }
            )
          })
          it('false', () => {
            const id = 'myId'
            assert.deepStrictEqual(
              ObjectSchema()
                .prop('foo', ObjectSchema().prop('bar', S.id(id)).required())
                .valueOf(),
              {
                properties: {
                  foo: {
                    properties: {
                      bar: { $id: 'myId' }
                    },
                    required: ['bar'],
                    type: 'object'
                  }
                },
                type: 'object'
              }
            )
          })
          it('invalid', () => {
            assert.throws(
              () => ObjectSchema().id(''),
              (err) =>
                err instanceof S.FluentSchemaError &&
                err.message ===
                  'id should not be an empty fragment <#> or an empty string <> (e.g. #myId)'
            )
          })
        })
      })

      describe('definitions', () => {
        it('true', () => {
          assert.deepStrictEqual(
            ObjectSchema({ generateIds: true })
              .definition('entity', ObjectSchema().prop('foo').prop('bar'))
              .prop('prop', S.ref('entity'))
              .valueOf(),
            {
              definitions: {
                entity: {
                  $id: '#definitions/entity',
                  properties: {
                    bar: {},
                    foo: {}
                  },
                  type: 'object'
                }
              },
              properties: {
                prop: {
                  $ref: 'entity'
                }
              },
              type: 'object'
            }
          )
        })

        it('false', () => {
          assert.deepStrictEqual(
            ObjectSchema({ generateIds: false })
              .definition('entity', ObjectSchema().id('myCustomId').prop('foo'))
              .prop('prop', S.ref('entity'))
              .valueOf(),
            {
              definitions: {
                entity: {
                  $id: 'myCustomId',
                  properties: {
                    foo: {}
                  },
                  type: 'object'
                }
              },
              properties: {
                prop: {
                  $ref: 'entity'
                }
              },
              type: 'object'
            }
          )
        })

        it('nested', () => {
          const id = 'myId'
          assert.deepStrictEqual(
            ObjectSchema()
              .prop(
                'foo',
                ObjectSchema().prop('bar', S.string().id(id)).required()
              )
              .valueOf(),
            {
              properties: {
                foo: {
                  properties: {
                    bar: { $id: 'myId', type: 'string' }
                  },
                  required: ['bar'],
                  type: 'object'
                }
              },
              type: 'object'
            }
          )
        })
      })
    })
  })

  it('from S', () => {
    assert.deepStrictEqual(S.object().valueOf(), {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object'
    })
  })

  it('sets a type object to the prop', () => {
    assert.strictEqual(
      ObjectSchema().prop('prop', S.object()).valueOf().properties.prop.type,
      'object'
    )
  })

  it('valueOf', () => {
    assert.deepStrictEqual(ObjectSchema().prop('foo', S.string()).valueOf(), {
      properties: { foo: { type: 'string' } },
      type: 'object'
    })
  })

  describe('keywords:', () => {
    describe('id', () => {
      it('valid', () => {
        const id = 'myId'
        assert.deepStrictEqual(ObjectSchema().prop('prop').id(id).valueOf(), {
          $id: id,
          properties: { prop: {} },
          type: 'object'
        })
      })

      describe('nested', () => {
        it('object', () => {
          const id = 'myId'
          assert.deepStrictEqual(
            ObjectSchema().prop('foo', S.string().id(id)).valueOf().properties
              .foo,
            {
              type: 'string',
              $id: id
            }
          )
        })

        it('string', () => {
          assert.deepStrictEqual(
            ObjectSchema().prop('foo', S.string().title('Foo')).valueOf()
              .properties,
            {
              foo: {
                type: 'string',
                title: 'Foo'
              }
            }
          )
        })
      })
    })

    describe('properties', () => {
      it('string', () => {
        assert.deepStrictEqual(
          ObjectSchema().prop('prop', S.string()).valueOf().properties,
          {
            prop: {
              type: 'string'
            }
          }
        )
      })

      describe('nested', () => {
        it('object', () => {
          assert.deepStrictEqual(
            ObjectSchema().prop('foo', ObjectSchema().prop('bar')).valueOf()
              .properties.foo.properties,
            {
              bar: { $id: undefined }
            }
          )
        })

        it('string', () => {
          assert.deepStrictEqual(
            ObjectSchema().prop('foo', S.string().title('Foo')).valueOf()
              .properties,
            {
              foo: {
                type: 'string',
                title: 'Foo'
              }
            }
          )
        })
      })
      describe('invalid', () => {
        it('throws an error passing a string as value', () => {
          assert.throws(
            () => ObjectSchema().prop('prop', 'invalid'),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'prop' doesn't support value '\"invalid\"'. Pass a FluentSchema object"
          )
        })

        it('throws an error passing a number as value', () => {
          assert.throws(
            () => ObjectSchema().prop('prop', 555),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'prop' doesn't support value '555'. Pass a FluentSchema object"
          )
        })

        it('throws an error passing an array as value', () => {
          assert.throws(
            () => ObjectSchema().prop('prop', []),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'prop' doesn't support value '[]'. Pass a FluentSchema object"
          )
        })
      })
    })

    describe('additionalProperties', () => {
      it('true', () => {
        const value = true
        assert.deepStrictEqual(
          ObjectSchema().additionalProperties(value).prop('prop').valueOf()
            .additionalProperties,
          value
        )
      })

      it('false', () => {
        const value = false
        assert.deepStrictEqual(
          ObjectSchema().additionalProperties(value).prop('prop').valueOf()
            .additionalProperties,
          value
        )
      })

      it('object', () => {
        assert.deepStrictEqual(
          ObjectSchema().additionalProperties(S.string()).prop('prop').valueOf()
            .additionalProperties,
          { type: 'string' }
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').additionalProperties(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'additionalProperties' must be a boolean or a S"
        )
      })
    })

    describe('maxProperties', () => {
      it('valid', () => {
        const value = 2
        assert.deepStrictEqual(
          ObjectSchema().maxProperties(value).prop('prop').valueOf()
            .maxProperties,
          value
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').maxProperties(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maxProperties' must be a Integer"
        )
      })
    })

    describe('minProperties', () => {
      it('valid', () => {
        const value = 2
        assert.deepStrictEqual(
          ObjectSchema().minProperties(value).prop('prop').valueOf()
            .minProperties,
          value
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').minProperties(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minProperties' must be a Integer"
        )
      })
    })

    describe('patternProperties', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .patternProperties({
              '^fo.*$': S.string()
            })
            .prop('foo')
            .valueOf(),
          {
            patternProperties: { '^fo.*$': { type: 'string' } },
            properties: { foo: {} },
            type: 'object'
          }
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').patternProperties(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': S.string() }"
        )
      })
    })

    describe('dependencies', () => {
      it('map of array', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .dependencies({
              foo: ['bar']
            })
            .prop('foo')
            .prop('bar')
            .valueOf(),
          {
            dependencies: { foo: ['bar'] },
            properties: {
              bar: {},
              foo: {}
            },
            type: 'object'
          }
        )
      })

      it('object', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .dependencies({
              foo: ObjectSchema().prop('bar', S.string())
            })
            .prop('foo')
            .valueOf(),
          {
            dependencies: {
              foo: {
                properties: {
                  bar: { type: 'string' }
                }
              }
            },
            properties: { foo: {} },
            type: 'object'
          }
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').dependencies(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'dependencies' invalid options. Provide a valid map e.g. { 'foo': ['bar'] } or { 'foo': S.string() }"
        )
      })
    })

    describe('dependentRequired', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .dependentRequired({
              foo: ['bar']
            })
            .prop('foo')
            .prop('bar')
            .valueOf(),
          {
            type: 'object',
            dependentRequired: {
              foo: ['bar']
            },
            properties: {
              foo: {},
              bar: {}
            }
          }
        )
      })

      it('invalid', () => {
        const value = {
          foo: ObjectSchema().prop('bar', S.string())
        }

        assert.throws(
          () => {
            assert.deepStrictEqual(
              ObjectSchema().dependentRequired(value).prop('foo'),
              value
            )
          },
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'dependentRequired' invalid options. Provide a valid array e.g. { 'foo': ['bar'] }"
        )
      })
    })

    describe('dependentSchemas', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .dependentSchemas({
              foo: ObjectSchema().prop('bar', S.string())
            })
            .prop('foo')
            .valueOf(),
          {
            dependentSchemas: {
              foo: {
                properties: {
                  bar: { type: 'string' }
                }
              }
            },
            properties: { foo: {} },
            type: 'object'
          }
        )
      })

      it('invalid', () => {
        const value = {
          foo: ['bar']
        }

        assert.throws(
          () => {
            assert.deepStrictEqual(
              ObjectSchema().dependentSchemas(value).prop('foo'),
              value
            )
          },
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'dependentSchemas' invalid options. Provide a valid schema e.g. { 'foo': S.string() }"
        )
      })
    })

    describe('propertyNames', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          ObjectSchema()
            .propertyNames(S.string().format(S.FORMATS.EMAIL))
            .prop('foo@bar.com')
            .valueOf().propertyNames,
          {
            format: 'email',
            type: 'string'
          }
        )
      })

      it('invalid', () => {
        const value = 'invalid'
        assert.throws(
          () =>
            assert.strictEqual(
              ObjectSchema().prop('prop').propertyNames(value),
              value
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'propertyNames' must be a S"
        )
      })
    })
  })

  describe('null', () => {
    it('sets a type object from the root', () => {
      assert.strictEqual(S.null().valueOf().type, 'null')
    })

    it('sets a type object from the prop', () => {
      assert.strictEqual(
        ObjectSchema().prop('value', S.null()).valueOf().properties.value.type,
        'null'
      )
    })
  })

  describe('definition', () => {
    it('add', () => {
      assert.deepStrictEqual(
        ObjectSchema()
          .definition('foo', ObjectSchema().prop('foo').prop('bar'))
          .valueOf().definitions,
        {
          foo: {
            type: 'object',
            properties: {
              foo: {},
              bar: {}
            }
          }
        }
      )
    })

    it('empty props', () => {
      assert.deepStrictEqual(
        ObjectSchema().definition('foo').valueOf().definitions,
        {
          foo: {}
        }
      )
    })

    it('with id', () => {
      assert.deepStrictEqual(
        ObjectSchema()
          .definition(
            'foo',
            ObjectSchema().id('myDefId').prop('foo').prop('bar')
          )
          .valueOf().definitions,
        {
          foo: {
            $id: 'myDefId',
            type: 'object',
            properties: {
              foo: {},
              bar: {}
            }
          }
        }
      )
    })
  })

  describe('extend', () => {
    it('extends a simple schema', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .additionalProperties(false)
        .prop('foo', S.string().minLength(5).required(true))

      const extended = S.object()
        .id('extended')
        .title('extended')
        .prop('bar', S.string().required())
        .extend(base)
      assert.deepStrictEqual(extended.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'extended',
        title: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'string',
            minLength: 5
          },
          bar: {
            type: 'string'
          }
        },
        required: ['foo', 'bar'],
        type: 'object'
      })
    })

    it('extends a nested schema', () => {
      const base = S.object()
        .id('base')
        .additionalProperties(false)
        .prop(
          'foo',
          S.object().prop('id', S.string().format('uuid').required())
        )
        .prop('str', S.string().required())
        .prop('bol', S.boolean().required())
        .prop('num', S.integer().required())

      const extended = S.object()
        .id('extended')
        .prop('bar', S.number())
        .extend(base)

      assert.deepStrictEqual(extended.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'object',
            properties: {
              id: {
                $id: undefined,
                type: 'string',
                format: 'uuid'
              }
            },
            required: ['id']
          },
          bar: {
            type: 'number'
          },
          str: {
            type: 'string'
          },
          bol: {
            type: 'boolean'
          },
          num: {
            type: 'integer'
          }
        },
        required: ['str', 'bol', 'num'],
        type: 'object'
      })
    })
    it('extends a schema with definitions', () => {
      const base = S.object()
        .id('base')
        .additionalProperties(false)
        .definition('def1', S.object().prop('some'))
        .definition('def2', S.object().prop('somethingElse'))
        .prop(
          'foo',
          S.object().prop('id', S.string().format('uuid').required())
        )
        .prop('str', S.string().required())
        .prop('bol', S.boolean().required())
        .prop('num', S.integer().required())

      const extended = S.object()
        .id('extended')
        .definition('def1', S.object().prop('someExtended'))
        .prop('bar', S.number())
        .extend(base)

      assert.deepStrictEqual(extended.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          def1: { type: 'object', properties: { some: {}, someExtended: {} } },
          def2: { type: 'object', properties: { somethingElse: {} } }
        },
        type: 'object',
        $id: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'object',
            properties: {
              id: { $id: undefined, type: 'string', format: 'uuid' }
            },
            required: ['id']
          },
          str: { type: 'string' },
          bol: { type: 'boolean' },
          num: { type: 'integer' },
          bar: { type: 'number' }
        },
        required: ['str', 'bol', 'num']
      })
    })
    it('extends a schema overriding the props', () => {
      const base = S.object().prop('reason', S.string().title('title'))

      const extended = S.object()
        .prop('other')
        .prop('reason', S.string().minLength(1))
        .extend(base)

      assert.deepStrictEqual(extended.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          other: {},
          reason: { title: 'title', type: 'string', minLength: 1 }
        }
      })
    })
    it('extends a chain of schemas overriding the props', () => {
      const base = S.object().prop('reason', S.string().title('title'))

      const extended = S.object()
        .prop('other')
        .prop('reason', S.string().minLength(1))
        .extend(base)

      const extendedAgain = S.object()
        .prop('again')
        .prop('reason', S.string().minLength(2))
        .extend(extended)
        .extend(S.object().prop('multiple'))

      assert.deepStrictEqual(extendedAgain.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          other: {},
          again: {},
          multiple: {},
          reason: { title: 'title', type: 'string', minLength: 2 }
        }
      })
    })

    it('throws an error if a schema is not provided', () => {
      assert.throws(
        () => S.object().extend(),
        (err) =>
          err instanceof S.FluentSchemaError &&
          err.message === "Schema can't be null or undefined"
      )
    })

    it('throws an error if a schema is invalid', () => {
      assert.throws(
        () => S.object().extend('boom!'),
        (err) =>
          err instanceof S.FluentSchemaError &&
          err.message === "Schema isn't FluentSchema type"
      )
    })

    it('throws an error if you append a new prop after extend', () => {
      assert.throws(
        () => {
          const base = S.object()
          S.object().extend(base).prop('foo')
        },
        (err) =>
          // err instanceof S.FluentSchemaError &&
          err instanceof TypeError &&
          err.message === 'S.object(...).extend(...).prop is not a function'
      )
    })
  })

  describe('only', () => {
    it('returns a subset of the object', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .prop('foo', S.string())
        .prop('bar', S.string())
        .prop('baz', S.string())
        .prop(
          'children',
          S.object().prop('alpha', S.string()).prop('beta', S.string())
        )

      const only = base.only(['foo'])

      assert.deepStrictEqual(only.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'base',
        properties: {
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      })
    })

    it('works correctly with required properties', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .prop('foo', S.string().required())
        .prop('bar', S.string())
        .prop('baz', S.string().required())
        .prop('qux', S.string())

      const only = base.only(['foo', 'bar'])

      assert.deepStrictEqual(only.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'base',
        properties: {
          foo: {
            type: 'string'
          },
          bar: {
            type: 'string'
          }
        },
        required: ['foo'],
        type: 'object'
      })
    })
  })

  describe('without', () => {
    it('returns a subset of the object', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .prop('foo', S.string())
        .prop('bar', S.string())
        .prop('baz', S.string())
        .prop(
          'children',
          S.object().prop('alpha', S.string()).prop('beta', S.string())
        )

      const without = base.without(['foo', 'children'])

      assert.deepStrictEqual(without.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'base',
        properties: {
          bar: {
            type: 'string'
          },
          baz: {
            type: 'string'
          }
        },
        type: 'object'
      })
    })

    it('works correctly with required properties', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .prop('foo', S.string().required())
        .prop('bar', S.string())
        .prop('baz', S.string().required())
        .prop('qux', S.string())

      const without = base.without(['foo', 'bar'])

      assert.deepStrictEqual(without.valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'base',
        properties: {
          baz: {
            type: 'string'
          },
          qux: {
            type: 'string'
          }
        },
        required: ['baz'],
        type: 'object'
      })
    })
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = ObjectSchema().raw({ customKeyword: true }).valueOf()

      assert.deepStrictEqual(schema, {
        type: 'object',
        customKeyword: true
      })
    })

    it('Carry raw properties', () => {
      const schema = S.object()
        .prop('test', S.ref('foo').raw({ test: true }))
        .valueOf()
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: { test: { $ref: 'foo', test: true } }
      })
    })

    it('Carry raw properties multiple props', () => {
      const schema = S.object()
        .prop('a', S.string())
        .prop('test', S.ref('foo').raw({ test: true }))
        .valueOf()
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: { a: { type: 'string' }, test: { $ref: 'foo', test: true } }
      })
    })
  })
})
