const { BaseSchema, FORMATS } = require('./BaseSchema')

describe('BaseSchema', () => {
  it('defined', () => {
    expect(BaseSchema).toBeDefined()
  })

  describe('constructor', () => {
    it.only('without params', () => {
      expect(BaseSchema().valueOf()).toEqual({
        // $schema: 'http://json-schema.org/draft-07/schema#',
      })
    })

    describe('options', () => {
      describe('generatedIds', () => {
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
        it.only('default', () => {
          const title = 'title'
          expect(
            BaseSchema()
              .title(title)
              .valueOf()
          ).toEqual({
            title,
          })
        })

        it.only('override', () => {
          const title = 'title'
          expect(
            BaseSchema({ factory: BaseSchema })
              .title(title)
              .valueOf()
          ).toEqual({
            title,
          })
        })
      })
    })
  })

  it('valueOf', () => {
    expect(BaseSchema().valueOf()).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
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

      it('nested', () => {
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

      it('adds to number prop', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .asNumber()
            .id(value)
            .valueOf().properties.prop.$id
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

      it('adds to number prop', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .asNumber()
            .title(value)
            .valueOf().properties.prop.title
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

      it('add to number prop', () => {
        const value = 'description'
        expect(
          BaseSchema()
            .prop('prop')
            .asNumber()
            .description(value)
            .valueOf().properties.prop.description
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

      it('add to number prop', () => {
        const value = [123]
        expect(
          BaseSchema()
            .prop('prop')
            .asNumber()
            .examples(value)
            .valueOf().properties.prop.examples
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

    describe('required', () => {
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

    it('ref', () => {
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
      it('two types', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .allOf([BaseSchema().asBoolean(), BaseSchema().asString()])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              allOf: [{ type: 'boolean' }, { type: 'string' }],
            },
          },
          type: 'object',
        })
      })
      it('object', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .allOf([
              BaseSchema()
                .prop('foo')
                .prop('bar')
                .asInteger(),
            ])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              allOf: [
                {
                  properties: {
                    bar: { type: 'integer' },
                    foo: { type: 'string' },
                  },
                  type: 'object',
                },
              ],
            },
          },
          type: 'object',
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .allOf('test')
          }).toThrow(
            "'allOf' must be a an array of BaseSchema rather than a 'string'"
          )
        })
        it('not an array of BaseSchema', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .allOf(['test'])
          }).toThrow(
            "'allOf' must be a an array of BaseSchema rather than a 'object'"
          )
        })
      })
    })

    describe('anyOf', () => {
      it('two types', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .anyOf([BaseSchema().asBoolean(), BaseSchema().asString()])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              anyOf: [{ type: 'boolean' }, { type: 'string' }],
            },
          },
          type: 'object',
        })
      })
      it('object', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .anyOf([
              BaseSchema()
                .prop('foo')
                .prop('bar')
                .asInteger(),
            ])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              anyOf: [
                {
                  properties: {
                    bar: { type: 'integer' },
                    foo: { type: 'string' },
                  },
                  type: 'object',
                },
              ],
            },
          },
          type: 'object',
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .anyOf('test')
          }).toThrow(
            "'anyOf' must be a an array of BaseSchema rather than a 'string'"
          )
        })
        it('not an array of BaseSchema', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .anyOf(['test'])
          }).toThrow(
            "'anyOf' must be a an array of BaseSchema rather than a 'object'"
          )
        })
      })
    })

    describe('oneOf', () => {
      it('two types', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .oneOf([BaseSchema().asBoolean(), BaseSchema().asString()])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              oneOf: [{ type: 'boolean' }, { type: 'string' }],
            },
          },
          type: 'object',
        })
      })
      it('object', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .oneOf([
              BaseSchema()
                .prop('foo')
                .prop('bar')
                .asInteger(),
            ])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              oneOf: [
                {
                  properties: {
                    bar: { type: 'integer' },
                    foo: { type: 'string' },
                  },
                  type: 'object',
                },
              ],
            },
          },
          type: 'object',
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .oneOf('test')
          }).toThrow(
            "'oneOf' must be a an array of BaseSchema rather than a 'string'"
          )
        })
        it('not an array of BaseSchema', () => {
          expect(() => {
            return BaseSchema()
              .prop('prop')
              .oneOf(['test'])
          }).toThrow(
            "'oneOf' must be a an array of BaseSchema rather than a 'object'"
          )
        })
      })
    })

    describe('not', () => {
      it('add prop not', () => {
        expect(
          BaseSchema()
            .prop('prop')
            .not()
            .anyOf([
              BaseSchema()
                .prop('boolean')
                .asBoolean()
                .prop('number')
                .asNumber(),
            ])
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              not: {
                anyOf: [
                  {
                    properties: {
                      boolean: { type: 'boolean' },
                      number: { type: 'number' },
                    },
                    type: 'object',
                  },
                ],
              },
            },
          },
          type: 'object',
        })
      })
    })
  })

  describe('ifThen', () => {
    it('simple', () => {
      expect(
        BaseSchema()
          .prop('prop')
          .maxLength(5)
          .ifThen(
            BaseSchema()
              .prop('prop')
              .maxLength(5),
            BaseSchema()
              .prop('extraProp')
              .required()
          )
          .valueOf()
      ).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          prop: {
            type: 'string',
            maxLength: 5,
          },
        },
        if: {
          properties: {
            prop: {
              type: 'string',
              maxLength: 5,
            },
          },
        },
        then: {
          properties: {
            extraProp: {
              type: 'string',
            },
          },
          required: ['extraProp'],
        },
        type: 'object',
      })
    })
  })

  describe('ifThenElse', () => {
    it('simple', () => {
      expect(
        BaseSchema()
          .prop('prop')
          .maxLength(5)
          .ifThenElse(
            BaseSchema()
              .prop('prop')
              .maxLength(5),
            BaseSchema()
              .prop('extraProp')
              .required(),
            BaseSchema()
              .prop('elseProp')
              .required()
          )
          .valueOf()
      ).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          prop: {
            type: 'string',
            maxLength: 5,
          },
        },
        if: {
          properties: {
            prop: {
              type: 'string',
              maxLength: 5,
            },
          },
        },
        then: {
          properties: {
            extraProp: {
              type: 'string',
            },
          },
          required: ['extraProp'],
        },
        else: {
          properties: {
            elseProp: {
              type: 'string',
            },
          },
          required: ['elseProp'],
        },
        type: 'object',
      })
    })
  })

  it('works', () => {
    // TODO LS https://json-schema.org/latest/json-schema-core.html#idExamples
    const schema = BaseSchema()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .definition(
        'address',
        BaseSchema()
          .id('#address')
          .prop('country')
          .prop('city')
          .prop('zipcode')
      )
      .prop('username')
      .required()
      .prop('password')
      .required()
      .prop('address')
      .ref('#address')
      .required()
      .prop(
        'role',
        BaseSchema()
          .id('http://foo.com/role')
          .prop('name')
          .prop('permissions')
      )
      .required()
      .prop('age')
      .asNumber()
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
