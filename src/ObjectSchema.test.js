const { ObjectSchema } = require('./ObjectSchema')
const { FluentSchema, FORMATS } = require('./FluentSchema')

describe('ObjectSchema', () => {
  it('defined', () => {
    expect(ObjectSchema).toBeDefined()
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
              .prop('prop')
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
            properties: { prop: { type: 'string' } },
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
              // $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                foo: {
                  $id: '#properties/foo',
                  properties: {
                    bar: {
                      $id: '#properties/foo/properties/bar',
                      type: 'string',
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
                    .prop(
                      'bar',
                      FluentSchema()
                        .asString()
                        .id(id)
                    )
                    //.id(id) FIXME LS as for ref the assign is wrong
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
              .prop('prop', FluentSchema().ref('entity'))
              .valueOf()
          ).toEqual({
            definitions: {
              entity: {
                $id: '#definitions/entity',
                properties: {
                  bar: {
                    type: 'string',
                  },
                  foo: {
                    type: 'string',
                  },
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
              .prop('prop', FluentSchema().ref('entity'))
              //.ref('entity') //FIXME LS wrong assignment
              .valueOf()
          ).toEqual({
            definitions: {
              entity: {
                $id: 'myCustomId',
                properties: {
                  foo: { type: 'string' },
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
                  .prop(
                    'bar',
                    FluentSchema()
                      .asString()
                      .id(id)
                  )
                  //.id(id) // FIXME id assigned to foo rather than bar prop
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

  it('from FluentSchema', () => {
    expect(
      FluentSchema()
        .asObject()
        .valueOf()
    ).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    })
  })

  it('sets a type object to the prop', () => {
    expect(
      ObjectSchema()
        .prop('prop', FluentSchema().asObject())
        .valueOf().properties.prop.type
    ).toEqual('object')
  })

  it('valueOf', () => {
    expect(
      ObjectSchema()
        .prop('foo', FluentSchema().asString())
        .valueOf()
    ).toEqual({ properties: { foo: { type: 'string' } }, type: 'object' })
  })

  describe('keywords:', () => {
    describe('properties', () => {
      it('with type string', () => {
        expect(
          ObjectSchema()
            .prop('prop')
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
            bar: {
              type: 'string',
            },
          })
        })

        it('string', () => {
          expect(
            ObjectSchema()
              .prop(
                'foo',
                FluentSchema()
                  .asString()
                  .title('Foo')
              )
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
            .additionalProperties(FluentSchema().asString())
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
        ).toThrow("'additionalProperties' must be a boolean or a FluentSchema")
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
              '^fo.*$': FluentSchema().asString(),
            })
            .prop('foo')
            .valueOf()
        ).toEqual({
          patternProperties: { '^fo.*$': { type: 'string' } },
          properties: { foo: { type: 'string' } },
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
          "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': FluentSchema().asString() }"
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
            bar: { type: 'string' },
            foo: { type: 'string' },
          },
          type: 'object',
        })
      })

      it('object', () => {
        expect(
          ObjectSchema()
            .dependencies({
              foo: ObjectSchema().prop('bar', FluentSchema().asString()),
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
          properties: { foo: { type: 'string' } },
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
          "'dependencies' invalid options. Provide a valid map e.g. { 'foo': ['ba'] } or { 'foo': FluentSchema().asString() }"
        )
      })
    })

    describe('propertyNames', () => {
      it('valid', () => {
        expect(
          ObjectSchema()
            .propertyNames(
              FluentSchema()
                .asString()
                .format(FORMATS.EMAIL)
            )
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
        ).toThrow("'propertyNames' must be a FluentSchema")
      })
    })
  })

  describe('null', () => {
    it('sets a type object from the root', () => {
      expect(
        FluentSchema()
          .asNull()
          .valueOf().type
      ).toEqual('null')
    })

    it('sets a type object from the prop', () => {
      expect(
        ObjectSchema()
          .prop('value', FluentSchema().asNull())

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
            foo: {
              type: 'string',
            },
            bar: {
              type: 'string',
            },
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
            foo: {
              type: 'string',
            },
            bar: {
              type: 'string',
            },
          },
        },
      })
    })
  })
})
