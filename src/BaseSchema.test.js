const { BaseSchema, FORMATS } = require('./BaseSchema')

describe('BaseSchema', () => {
  it('defined', () => {
    expect(BaseSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(BaseSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
      })
    })

    describe('options', () => {
      //LS TODO move to ObjectSchema
      describe.skip('generatedIds', () => {
        describe('properties', () => {
          it('true', () => {
            expect(
              BaseSchema({ generateIds: true })
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
              BaseSchema()
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
                BaseSchema({ generateIds: true })
                  .prop(
                    'foo',
                    BaseSchema()
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
                BaseSchema()
                  .prop(
                    'foo',
                    BaseSchema()
                      .prop('bar')
                      .id(id)
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
              BaseSchema({ generateIds: true })
                .definition(
                  'entity',
                  BaseSchema()
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
              BaseSchema({ generateIds: false })
                .definition(
                  'entity',
                  BaseSchema()
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
              BaseSchema()
                .prop(
                  'foo',
                  BaseSchema()
                    .prop('bar')
                    .id(id)
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

      describe('factory', () => {
        it('default', () => {
          const title = 'title'
          expect(
            BaseSchema()
              .title(title)
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            title,
          })
        })

        it('override', () => {
          const title = 'title'
          expect(
            BaseSchema({ factory: BaseSchema })
              .title(title)
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            title,
          })
        })
      })
    })
  })

  describe('keywords (any):', () => {
    describe('id', () => {
      const value = 'customId'
      it('to root', () => {
        expect(
          BaseSchema()
            .id(value)
            .valueOf().$id
        ).toEqual(value)
      })

      // TODO LS move to ObjectSchema
      it.skip('nested', () => {
        expect(
          BaseSchema()
            .prop(
              'foo',
              BaseSchema()
                .id(value)
                .prop('bar')
                .required()
            )
            .valueOf().properties.foo.$id
        ).toEqual(value)
      })
    })

    describe('title', () => {
      const value = 'title'
      it('adds to root', () => {
        expect(
          BaseSchema()
            .title(value)
            .valueOf().title
        ).toEqual(value)
      })
    })

    describe('description', () => {
      it('add to root', () => {
        const value = 'description'
        expect(
          BaseSchema()
            .description(value)
            .valueOf().description
        ).toEqual(value)
      })
    })

    describe('examples', () => {
      it('adds to root', () => {
        const value = ['example']
        expect(
          BaseSchema()
            .examples(value)
            .valueOf().examples
        ).toEqual(value)
      })

      it('invalid', () => {
        const value = 'examples'
        expect(
          () =>
            BaseSchema()
              .examples(value)
              .valueOf().examples
        ).toThrow("'examples' must be an array e.g. ['1', 'one', 'foo']")
      })
    })
    // TODO LS test with FluentSchema.asObject()
    describe.skip('required', () => {
      it('valid', () => {
        const prop = 'foo'
        expect(
          BaseSchema()
            .prop(prop)
            .required()
            .valueOf().required
        ).toEqual([prop])
      })

      it('invalid', () => {
        expect(() => {
          BaseSchema()
            .asString()
            .required()
        }).toThrow(
          "'required' has to be chained to a prop: \nExamples: \n- BaseSchema().prop('prop').required() \n- BaseSchema().prop('prop', BaseSchema().asNumber()).required()"
        )
      })
    })

    // TODO LS evaluate to move to ObjectSchema
    it.skip('ref', () => {
      const value = 'description'
      expect(
        BaseSchema()
          .description(value)
          .valueOf().description
      ).toEqual(value)
    })
  })

  describe('combining keywords:', () => {
    describe('allOf', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .allOf([BaseSchema().id('foo')])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          allOf: [{ $id: 'foo' }],
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().allOf('test')
          }).toThrow(
            "'allOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().allOf(['test'])
          }).toThrow(
            "'allOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('anyOf', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .anyOf([BaseSchema().id('foo')])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          anyOf: [{ $id: 'foo' }],
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().anyOf('test')
          }).toThrow(
            "'anyOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().anyOf(['test'])
          }).toThrow(
            "'anyOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('oneOf', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .oneOf([BaseSchema().id('foo')])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          oneOf: [{ $id: 'foo' }],
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().oneOf('test')
          }).toThrow(
            "'oneOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().oneOf(['test'])
          }).toThrow(
            "'oneOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('not', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .not(BaseSchema().anyOf([BaseSchema().id('foo')]))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          not: { anyOf: [{ $id: 'foo' }] },
        })
      })
    })
  })

  describe('ifThen', () => {
    it('valid', () => {
      const id = 'http://foo.com/user'
      const schema = BaseSchema()
        .id(id)
        .title('A User')
        .ifThen(BaseSchema().id(id), BaseSchema().description('A User desc'))
        .valueOf()

      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'http://foo.com/user',
        title: 'A User',
        if: { $id: 'http://foo.com/user' },
        then: { description: 'A User desc' },
      })
    })
  })

  describe('ifThenElse', () => {
    it('valid', () => {
      const id = 'http://foo.com/user'
      const schema = BaseSchema()
        .id(id)
        .title('A User')
        .ifThenElse(
          BaseSchema().id(id),
          BaseSchema().description('then'),
          BaseSchema().description('else')
        )
        .valueOf()

      expect(schema).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'http://foo.com/user',
        title: 'A User',
        if: { $id: 'http://foo.com/user' },
        then: { description: 'then' },
        else: { description: 'else' },
      })
    })
  })
})
