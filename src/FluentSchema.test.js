'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const S = require('./FluentJSONSchema')

describe('S', () => {
  it('defined', () => {
    assert.notStrictEqual(S, undefined)
  })

  describe('factory', () => {
    it('without params', () => {
      assert.deepStrictEqual(S.object().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object'
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          assert.deepStrictEqual(
            S.withOptions({ generateIds: true })
              .object()
              .prop('prop', S.string())
              .valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: { prop: { $id: '#properties/prop', type: 'string' } },
              type: 'object'
            }
          )
        })

        it('false', () => {
          assert.deepStrictEqual(
            S.object().prop('prop', S.string()).valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: { prop: { type: 'string' } },
              type: 'object'
            }
          )
        })

        describe('nested', () => {
          it('true', () => {
            assert.deepStrictEqual(
              S.withOptions({ generateIds: true })
                .object()
                .prop('foo', S.object().prop('bar', S.string()).required())
                .valueOf(),
              {
                $schema: 'http://json-schema.org/draft-07/schema#',
                properties: {
                  foo: {
                    $id: '#properties/foo',
                    properties: {
                      bar: {
                        $id: '#properties/foo/properties/bar',
                        type: 'string'
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
              S.object()
                .prop(
                  'foo',
                  S.object()
                    .prop('bar', S.string().id(id))

                    .required()
                )
                .valueOf(),
              {
                $schema: 'http://json-schema.org/draft-07/schema#',
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
      // TODO LS not sure the test makes sense
      describe('definitions', () => {
        it('true', () => {
          assert.deepStrictEqual(
            S.withOptions({ generateIds: true })
              .object()
              .definition(
                'entity',
                S.object().prop('foo', S.string()).prop('bar', S.string())
              )
              .prop('prop')
              .ref('entity')
              .valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {
                entity: {
                  $id: '#definitions/entity',
                  properties: {
                    bar: {
                      type: 'string'
                    },
                    foo: {
                      type: 'string'
                    }
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
            S.withOptions({ generateIds: false })
              .object()
              .definition(
                'entity',
                S.object().id('myCustomId').prop('foo', S.string())
              )
              .prop('prop')
              .ref('entity')
              .valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {
                entity: {
                  $id: 'myCustomId',
                  properties: {
                    foo: { type: 'string' }
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
            S.object()
              .prop('foo', S.object().prop('bar', S.string().id(id)).required())
              .valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
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

  describe('composition', () => {
    it('anyOf', () => {
      const schema = S.object()
        .prop('foo', S.anyOf([S.string()]))
        .valueOf()
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: { foo: { anyOf: [{ type: 'string' }] } },
        type: 'object'
      })
    })

    it('oneOf', () => {
      const schema = S.object()
        .prop(
          'multipleRestrictedTypesKey',
          S.oneOf([S.string(), S.number().minimum(10)])
        )
        .prop('notTypeKey', S.not(S.oneOf([S.string().pattern('js$')])))
        .valueOf()
      assert.deepStrictEqual(schema, {
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          multipleRestrictedTypesKey: {
            oneOf: [{ type: 'string' }, { minimum: 10, type: 'number' }]
          },
          notTypeKey: { not: { oneOf: [{ pattern: 'js$', type: 'string' }] } }
        },
        type: 'object'
      })
    })
  })

  it('valueOf', () => {
    assert.deepStrictEqual(S.object().prop('foo', S.string()).valueOf(), {
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { foo: { type: 'string' } },
      type: 'object'
    })
  })

  it('works', () => {
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
      .prop('password', S.string())
      .required()
      .prop('address', S.ref('#address'))

      .required()
      .prop(
        'role',
        S.object()
          .id('http://foo.com/role')
          .prop('name', S.string())
          .prop('permissions', S.string())
      )
      .required()
      .prop('age', S.number())

      .valueOf()

    assert.deepStrictEqual(schema, {
      definitions: {
        address: {
          type: 'object',
          $id: '#address',
          properties: {
            country: {
              type: 'string'
            },
            city: {
              type: 'string'
            },
            zipcode: {
              type: 'string'
            }
          }
        }
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['username', 'password', 'address', 'role'],
      $id: 'http://foo.com/user',
      title: 'A User',
      description: 'A User desc',
      properties: {
        username: {
          type: 'string'
        },
        password: {
          type: 'string'
        },
        address: {
          $ref: '#address'
        },
        age: {
          type: 'number'
        },
        role: {
          type: 'object',
          $id: 'http://foo.com/role',
          properties: {
            name: {
              $id: undefined,
              type: 'string'
            },
            permissions: {
              $id: undefined,
              type: 'string'
            }
          }
        }
      }
    })
  })

  describe('raw', () => {
    describe('base', () => {
      it('parses type', () => {
        const input = S.enum(['foo']).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('adds an attribute', () => {
        const input = S.enum(['foo']).valueOf()
        const schema = S.raw(input)
        const attribute = 'title'
        const modified = schema.title(attribute)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          ...input,
          title: attribute
        })
      })
    })

    describe('string', () => {
      it('parses type', () => {
        const input = S.string().valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('adds an attribute', () => {
        const input = S.string().valueOf()
        const schema = S.raw(input)
        const modified = schema.minLength(3)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          minLength: 3,
          ...input
        })
      })

      it('parses a prop', () => {
        const input = S.string().minLength(5).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })

    describe('number', () => {
      it('parses type', () => {
        const input = S.number().valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('adds an attribute', () => {
        const input = S.number().valueOf()
        const schema = S.raw(input)
        const modified = schema.maximum(3)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          maximum: 3,
          ...input
        })
      })

      it('parses a prop', () => {
        const input = S.number().maximum(5).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })

    describe('integer', () => {
      it('parses type', () => {
        const input = S.integer().valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('adds an attribute', () => {
        const input = S.integer().valueOf()
        const schema = S.raw(input)
        const modified = schema.maximum(3)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          maximum: 3,
          ...input
        })
      })

      it('parses a prop', () => {
        const input = S.integer().maximum(5).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })

    describe('boolean', () => {
      it('parses type', () => {
        const input = S.boolean().valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })

    describe('object', () => {
      it('parses type', () => {
        const input = S.object().valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('parses properties', () => {
        const input = S.object().prop('foo').prop('bar', S.string()).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('parses nested properties', () => {
        const input = S.object()
          .prop('foo', S.object().prop('bar', S.string().minLength(3)))
          .valueOf()
        const schema = S.raw(input)
        const modified = schema.prop('boom')
        assert.ok(modified.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          ...input,
          properties: {
            ...input.properties,
            boom: {}
          }
        })
      })

      it('parses definitions', () => {
        const input = S.object().definition('foo', S.string()).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })

    describe('array', () => {
      it('parses type', () => {
        const input = S.array().items(S.string()).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })

      it('parses properties', () => {
        const input = S.array().items(S.string()).valueOf()

        const schema = S.raw(input).maxItems(1)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input,
          maxItems: 1
        })
      })

      it('parses nested properties', () => {
        const input = S.array()
          .items(
            S.object().prop(
              'foo',
              S.object().prop('bar', S.string().minLength(3))
            )
          )
          .valueOf()
        const schema = S.raw(input)
        const modified = schema.maxItems(1)
        assert.ok(modified.isFluentSchema)
        assert.deepStrictEqual(modified.valueOf(), {
          ...input,
          maxItems: 1
        })
      })

      it('parses definitions', () => {
        const input = S.object().definition('foo', S.string()).valueOf()
        const schema = S.raw(input)
        assert.ok(schema.isFluentSchema)
        assert.deepStrictEqual(schema.valueOf(), {
          ...input
        })
      })
    })
  })
})
