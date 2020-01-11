const { ObjectSchema } = require('./ObjectSchema')
const S = require('./FluentSchema')

describe('ObjectSchema', () => {
  it('defined', () => {
    expect(ObjectSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(ObjectSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(ObjectSchema().valueOf()).toEqual({
        // $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          expect(
            ObjectSchema({ generateIds: true })
              .prop('prop', S.string())
              .valueOf()
          ).toEqual({
            properties: { prop: { $id: '#properties/prop', type: 'string' } },
            type: 'object',
          })
        })

        it('false', () => {
          expect(
            ObjectSchema()
              .prop('prop')
              .valueOf()
          ).toEqual({
            properties: { prop: {} },
            type: 'object',
          })
        })

        describe('nested', () => {
          it('true', () => {
            expect(
              ObjectSchema({ generateIds: true })
                .prop(
                  'foo',
                  ObjectSchema()
                    .prop('bar')
                    .required()
                )
                .valueOf()
            ).toEqual({
              properties: {
                foo: {
                  $id: '#properties/foo',
                  properties: {
                    bar: {
                      $id: '#properties/foo/properties/bar',
                    },
                  },
                  required: ['bar'],
                  type: 'object',
                },
              },
              type: 'object',
            })
          })
          it('false', () => {
            const id = 'myId'
            expect(
              ObjectSchema()
                .prop(
                  'foo',
                  ObjectSchema()
                    .prop('bar', S.id(id))
                    .required()
                )
                .valueOf()
            ).toEqual({
              properties: {
                foo: {
                  properties: {
                    bar: { $id: 'myId' },
                  },
                  required: ['bar'],
                  type: 'object',
                },
              },
              type: 'object',
            })
          })
        })
      })

      describe('definitions', () => {
        it('true', () => {
          expect(
            ObjectSchema({ generateIds: true })
              .definition(
                'entity',
                ObjectSchema()
                  .prop('foo')
                  .prop('bar')
              )
              .prop('prop', S.ref('entity'))
              .valueOf()
          ).toEqual({
            definitions: {
              entity: {
                $id: '#definitions/entity',
                properties: {
                  bar: {},
                  foo: {},
                },
                type: 'object',
              },
            },
            properties: {
              prop: {
                $ref: 'entity',
              },
            },
            type: 'object',
          })
        })

        it('false', () => {
          expect(
            ObjectSchema({ generateIds: false })
              .definition(
                'entity',
                ObjectSchema()
                  .id('myCustomId')
                  .prop('foo')
              )
              .prop('prop', S.ref('entity'))
              .valueOf()
          ).toEqual({
            definitions: {
              entity: {
                $id: 'myCustomId',
                properties: {
                  foo: {},
                },
                type: 'object',
              },
            },
            properties: {
              prop: {
                $ref: 'entity',
              },
            },
            type: 'object',
          })
        })

        it('nested', () => {
          const id = 'myId'
          expect(
            ObjectSchema()
              .prop(
                'foo',
                ObjectSchema()
                  .prop('bar', S.string().id(id))
                  .required()
              )
              .valueOf()
          ).toEqual({
            properties: {
              foo: {
                properties: {
                  bar: { $id: 'myId', type: 'string' },
                },
                required: ['bar'],
                type: 'object',
              },
            },
            type: 'object',
          })
        })
      })
    })
  })

  it('from S', () => {
    expect(S.object().valueOf()).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    })
  })

  it('sets a type object to the prop', () => {
    expect(
      ObjectSchema()
        .prop('prop', S.object())
        .valueOf().properties.prop.type
    ).toEqual('object')
  })

  it('valueOf', () => {
    expect(
      ObjectSchema()
        .prop('foo', S.string())
        .valueOf()
    ).toEqual({ properties: { foo: { type: 'string' } }, type: 'object' })
  })

  describe('keywords:', () => {
    describe('id', () => {
      it('valid', () => {
        const id = 'myId'
        const prop = 'prop'
        expect(
          ObjectSchema()
            .prop('prop')
            .id(id)
            .valueOf().properties[prop]
        ).toEqual({
          $id: id,
        })
      })

      describe('nested', () => {
        it('object', () => {
          const id = 'myId'
          expect(
            ObjectSchema()
              .prop('foo', S.string().id(id))
              .valueOf().properties.foo
          ).toEqual({
            type: 'string',
            $id: id,
          })
        })

        it('string', () => {
          expect(
            ObjectSchema()
              .prop('foo', S.string().title('Foo'))
              .valueOf().properties
          ).toEqual({
            foo: {
              type: 'string',
              title: 'Foo',
            },
          })
        })
      })
    })

    describe('properties', () => {
      it('string', () => {
        expect(
          ObjectSchema()
            .prop('prop', S.string())
            .valueOf().properties
        ).toEqual({
          prop: {
            type: 'string',
          },
        })
      })

      describe('nested', () => {
        it('object', () => {
          expect(
            ObjectSchema()
              .prop('foo', ObjectSchema().prop('bar'))
              .valueOf().properties.foo.properties
          ).toEqual({
            bar: {},
          })
        })

        it('string', () => {
          expect(
            ObjectSchema()
              .prop('foo', S.string().title('Foo'))
              .valueOf().properties
          ).toEqual({
            foo: {
              type: 'string',
              title: 'Foo',
            },
          })
        })
      })
    })

    describe('additionalProperties', () => {
      it('true', () => {
        const value = true
        expect(
          ObjectSchema()
            .additionalProperties(value)
            .prop('prop')
            .valueOf().additionalProperties
        ).toEqual(value)
      })

      it('false', () => {
        const value = false
        expect(
          ObjectSchema()
            .additionalProperties(value)
            .prop('prop')
            .valueOf().additionalProperties
        ).toEqual(value)
      })

      it('object', () => {
        expect(
          ObjectSchema()
            .additionalProperties(S.string())
            .prop('prop')
            .valueOf().additionalProperties
        ).toEqual({ type: 'string' })
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .additionalProperties(value)
          ).toEqual(value)
        ).toThrow("'additionalProperties' must be a boolean or a S")
      })
    })

    describe('maxProperties', () => {
      it('valid', () => {
        const value = 2
        expect(
          ObjectSchema()
            .maxProperties(value)
            .prop('prop')
            .valueOf().maxProperties
        ).toEqual(value)
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .maxProperties(value)
          ).toEqual(value)
        ).toThrow("'maxProperties' must be a Integer")
      })
    })

    describe('minProperties', () => {
      it('valid', () => {
        const value = 2
        expect(
          ObjectSchema()
            .minProperties(value)
            .prop('prop')
            .valueOf().minProperties
        ).toEqual(value)
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .minProperties(value)
          ).toEqual(value)
        ).toThrow("'minProperties' must be a Integer")
      })
    })

    describe('patternProperties', () => {
      it('valid', () => {
        expect(
          ObjectSchema()
            .patternProperties({
              '^fo.*$': S.string(),
            })
            .prop('foo')
            .valueOf()
        ).toEqual({
          patternProperties: { '^fo.*$': { type: 'string' } },
          properties: { foo: {} },
          type: 'object',
        })
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .patternProperties(value)
          ).toEqual(value)
        ).toThrow(
          "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': S.string() }"
        )
      })
    })

    describe('dependencies', () => {
      it('map of array', () => {
        expect(
          ObjectSchema()
            .dependencies({
              foo: ['bar'],
            })
            .prop('foo')
            .prop('bar')
            .valueOf()
        ).toEqual({
          dependencies: { foo: ['bar'] },
          properties: {
            bar: {},
            foo: {},
          },
          type: 'object',
        })
      })

      it('object', () => {
        expect(
          ObjectSchema()
            .dependencies({
              foo: ObjectSchema().prop('bar', S.string()),
            })
            .prop('foo')
            .valueOf()
        ).toEqual({
          dependencies: {
            foo: {
              properties: {
                bar: { type: 'string' },
              },
            },
          },
          properties: { foo: {} },
          type: 'object',
        })
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .dependencies(value)
          ).toEqual(value)
        ).toThrow(
          "'dependencies' invalid options. Provide a valid map e.g. { 'foo': ['ba'] } or { 'foo': S.string() }"
        )
      })
    })

    describe('propertyNames', () => {
      it('valid', () => {
        expect(
          ObjectSchema()
            .propertyNames(S.string().format(S.FORMATS.EMAIL))
            .prop('foo@bar.com')
            .valueOf().propertyNames
        ).toEqual({
          format: 'email',
          type: 'string',
        })
      })

      it('invalid', () => {
        const value = 'invalid'
        expect(() =>
          expect(
            ObjectSchema()
              .prop('prop')
              .propertyNames(value)
          ).toEqual(value)
        ).toThrow("'propertyNames' must be a S")
      })
    })
  })

  describe('null', () => {
    it('sets a type object from the root', () => {
      expect(S.null().valueOf().type).toEqual('null')
    })

    it('sets a type object from the prop', () => {
      expect(
        ObjectSchema()
          .prop('value', S.null())

          .valueOf().properties.value.type
      ).toEqual('null')
    })
  })

  describe('definition', () => {
    it('add', () => {
      expect(
        ObjectSchema()
          .definition(
            'foo',
            ObjectSchema()
              .prop('foo')
              .prop('bar')
          )
          .valueOf().definitions
      ).toEqual({
        foo: {
          type: 'object',
          properties: {
            foo: {},
            bar: {},
          },
        },
      })
    })

    it('with id', () => {
      expect(
        ObjectSchema()
          .definition(
            'foo',
            ObjectSchema()
              .id('myDefId')
              .prop('foo')
              .prop('bar')
          )
          .valueOf().definitions
      ).toEqual({
        foo: {
          $id: 'myDefId',
          type: 'object',
          properties: {
            foo: {},
            bar: {},
          },
        },
      })
    })
  })

  describe('extend', () => {
    it('extends a simple schema', () => {
      const base = S.object()
        .id('base')
        .title('base')
        .additionalProperties(false)
        .prop('foo', S.string().minLength(5))

      const extended = S.object()
        .id('extended')
        .title('extended')
        .prop('bar', S.number())
        .extend(base)

      expect(extended.valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'extended',
        title: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'string',
            minLength: 5,
          },
          bar: {
            type: 'number',
          },
        },
        type: 'object',
      })
    })
    it('extends a nested schema', () => {
      const base = S.object()
        .id('base')
        .additionalProperties(false)
        .prop(
          'foo',
          S.object().prop(
            'id',
            S.string()
              .format('uuid')
              .required()
          )
        )
        .prop('str', S.string().required())
        .prop('bol', S.boolean().required())
        .prop('num', S.integer().required())

      const extended = S.object()
        .id('extended')
        .prop('bar', S.number())
        .extend(base)

      expect(extended.valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
            },
            required: ['id'],
          },
          bar: {
            type: 'number',
          },
          str: {
            type: 'string',
          },
          bol: {
            type: 'boolean',
          },
          num: {
            type: 'integer',
          },
        },
        required: ['str', 'bol', 'num'],
        type: 'object',
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
          S.object().prop(
            'id',
            S.string()
              .format('uuid')
              .required()
          )
        )
        .prop('str', S.string().required())
        .prop('bol', S.boolean().required())
        .prop('num', S.integer().required())

      const extended = S.object()
        .id('extended')
        .definition('def1', S.object().prop('someExtended'))
        .prop('bar', S.number())
        .extend(base)

      expect(extended.valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          def1: { type: 'object', properties: { someExtended: {} } },
          def2: { type: 'object', properties: { somethingElse: {} } },
        },
        type: 'object',
        $id: 'extended',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'object',
            properties: { id: { type: 'string', format: 'uuid' } },
            required: ['id'],
          },
          str: { type: 'string' },
          bol: { type: 'boolean' },
          num: { type: 'integer' },
          bar: { type: 'number' },
        },
        required: ['str', 'bol', 'num'],
      })
    })

    it('throws an error if a schema is not provided', () => {
      expect(() => {
        S.object().extend()
      }).toThrow("Schema can't be null or undefined")
    })
    it('throws an error if a schema is not provided', () => {
      expect(() => {
        S.object().extend('boom!')
      }).toThrow("Schema isn't FluentSchema type")
    })
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = ObjectSchema()
        .raw({ customKeyword: true })
        .valueOf()

      expect(schema).toEqual({
        type: 'object',
        customKeyword: true,
      })
    })
  })
})
