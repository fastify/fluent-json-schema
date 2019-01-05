const { FluentSchema, FORMATS } = require('./FluentSchema')

describe('FluentSchema', () => {
  it('defined', () => {
    expect(FluentSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(FluentSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          expect(
            FluentSchema({ generateIds: true })
              .object()
              .prop('prop')
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: { prop: { $id: '#properties/prop', type: 'string' } },
            type: 'object',
          })
        })

        it('false', () => {
          expect(
            FluentSchema()
              .object()
              .prop('prop')
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: { prop: { type: 'string' } },
            type: 'object',
          })
        })

        describe('nested', () => {
          it('true', () => {
            expect(
              FluentSchema({ generateIds: true })
                .object()
                .prop(
                  'foo',
                  FluentSchema()
                    .object()
                    .prop('bar')
                    .required()
                )
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
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
              FluentSchema()
                .object()
                .prop(
                  'foo',
                  FluentSchema()
                    .object()
                    .prop(
                      'bar',
                      FluentSchema()
                        .string()
                        .id(id)
                    )

                    .required()
                )
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
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
            FluentSchema({ generateIds: true })
              .object()
              .definition(
                'entity',
                FluentSchema()
                  .object()
                  .prop('foo')
                  .prop('bar')
              )
              .prop('prop')
              .ref('entity')
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
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
            FluentSchema({ generateIds: false })
              .object()
              .definition(
                'entity',
                FluentSchema()
                  .object()
                  .id('myCustomId')
                  .prop('foo')
              )
              .prop('prop')
              .ref('entity')
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
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
            FluentSchema()
              .object()
              .prop(
                'foo',
                FluentSchema()
                  .object()
                  .prop(
                    'bar',
                    FluentSchema()
                      .string()
                      .id(id)
                  )
                  .required()
              )
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
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

  describe('composition', () => {
    it('anyOf', () => {
      const schema = FluentSchema()
        .object()
        .prop('foo', FluentSchema().anyOf([FluentSchema().string()]))
        .valueOf()
      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: { foo: { anyOf: [{ type: 'string' }] } },
        type: 'object',
      })
    })

    it('oneOf', () => {
      const schema = FluentSchema()
        .object()
        .prop(
          'multipleRestrictedTypesKey',
          FluentSchema().oneOf([
            FluentSchema().string(),
            FluentSchema()
              .number()
              .minimum(10),
          ])
        )
        .prop(
          'notTypeKey',
          FluentSchema().not(
            FluentSchema().oneOf([
              FluentSchema()
                .string()
                .pattern('js$'),
            ])
          )
        )
        .valueOf()
      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          multipleRestrictedTypesKey: {
            oneOf: [{ type: 'string' }, { minimum: 10, type: 'number' }],
          },
          notTypeKey: { not: { oneOf: [{ pattern: 'js$', type: 'string' }] } },
        },
        type: 'object',
      })
    })
  })

  it('valueOf', () => {
    expect(
      FluentSchema()
        .object()
        .prop('foo', FluentSchema().string())
        .valueOf()
    ).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: { foo: { type: 'string' } },
      type: 'object',
    })
  })

  it('works', () => {
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
      .prop('password')
      .required()
      .prop('address', FluentSchema().ref('#address'))

      .required()
      .prop(
        'role',
        FluentSchema()
          .object()
          .id('http://foo.com/role')
          .prop('name')
          .prop('permissions')
      )
      .required()
      .prop('age', FluentSchema().number())

      .valueOf()

    expect(schema).toEqual({
      definitions: {
        address: {
          type: 'object',
          $id: '#address',
          properties: {
            country: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            zipcode: {
              type: 'string',
            },
          },
        },
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      required: ['username', 'password', 'address', 'role'],
      $id: 'http://foo.com/user',
      title: 'A User',
      description: 'A User desc',
      properties: {
        username: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        address: {
          $ref: '#address',
        },
        age: {
          type: 'number',
        },
        role: {
          type: 'object',
          $id: 'http://foo.com/role',
          properties: {
            name: {
              type: 'string',
            },
            permissions: {
              type: 'string',
            },
          },
        },
      },
    })
  })
})
