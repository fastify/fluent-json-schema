const { StringSchema, FORMATS } = require('./StringSchema')
const { FluentSchema } = require('./FluentSchema')

describe('StringSchema', () => {
  it('defined', () => {
    expect(StringSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(StringSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          expect(
            StringSchema({ generateIds: true })
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
            StringSchema()
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
              StringSchema({ generateIds: true })
                .prop(
                  'foo',
                  StringSchema()
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
              StringSchema()
                .prop(
                  'foo',
                  StringSchema()
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
            StringSchema({ generateIds: true })
              .definition(
                'entity',
                StringSchema()
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
            StringSchema({ generateIds: false })
              .definition(
                'entity',
                StringSchema()
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
            StringSchema()
              .prop(
                'foo',
                StringSchema()
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
  })

  it('valueOf', () => {
    expect(StringSchema().valueOf()).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    })
  })

  describe('keywords (any):', () => {
    describe('id', () => {
      const value = 'customId'
      it('to root', () => {
        expect(
          StringSchema()
            .id(value)
            .valueOf().$id
        ).toEqual(value)
      })

      it('nested', () => {
        expect(
          StringSchema()
            .prop(
              'foo',
              StringSchema()
                .id(value)
                .prop('bar')
                .required()
            )
            .valueOf().properties.foo.$id
        ).toEqual(value)
      })

      it('adds to number prop', () => {
        expect(
          StringSchema()
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
          StringSchema()
            .title(value)
            .valueOf().title
        ).toEqual(value)
      })

      it('adds to number prop', () => {
        expect(
          StringSchema()
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
          StringSchema()
            .description(value)
            .valueOf().description
        ).toEqual(value)
      })

      it('add to number prop', () => {
        const value = 'description'
        expect(
          StringSchema()
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
          StringSchema()
            .examples(value)
            .valueOf().examples
        ).toEqual(value)
      })

      it('add to number prop', () => {
        const value = [123]
        expect(
          StringSchema()
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
            StringSchema()
              .examples(value)
              .valueOf().examples
        ).toThrow("'examples' must be an array e.g. ['1', 'one', 'foo']")
      })
    })

    describe('required', () => {
      it('valid', () => {
        const prop = 'foo'
        expect(
          StringSchema()
            .prop(prop)
            .required()
            .valueOf().required
        ).toEqual([prop])
      })

      it('invalid', () => {
        expect(() => {
          StringSchema()
            .asString()
            .required()
        }).toThrow(
          "'required' has to be chained to a prop: \nExamples: \n- StringSchema().prop('prop').required() \n- StringSchema().prop('prop', StringSchema().asNumber()).required()"
        )
      })
    })

    it('ref', () => {
      const value = 'description'
      expect(
        StringSchema()
          .description(value)
          .valueOf().description
      ).toEqual(value)
    })
  })

  describe('types:', () => {
    describe('any', () => {
      describe('enum', () => {
        it('sets values', () => {
          const prop = 'prop'
          expect(
            StringSchema()
              .prop(prop)
              .enum(['ONE', 'TWO'])
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'string',
                enum: ['ONE', 'TWO'],
              },
            },
            type: 'object',
          })
        })
      })
      describe('const', () => {
        it('sets const', () => {
          const prop = 'prop'
          expect(
            StringSchema()
              .prop(prop)
              .const('ONE')
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: {
                type: 'string',
                const: 'ONE',
              },
            },
            type: 'object',
          })
        })
      })
    })
    describe('string', () => {
      it('returns a type to the root schema', () => {
        expect(
          StringSchema()
            .asString()
            .valueOf().type
        ).toEqual('string')
      })

      it('returns a type to the root schema', () => {
        expect(
          StringSchema()
            .prop('value')
            .asString()
            .valueOf().properties.value.type
        ).toEqual('string')
      })

      describe('keywords:', () => {
        describe('minLength', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .minLength(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  minLength: 5,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asString()
                .minLength('5.1')
            ).toThrow("'minLength' must be an Integer")
          })
        })
        describe('maxLength', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .maxLength(10)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  maxLength: 10,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asString()
                .maxLength('5.1')
            ).toThrow("'maxLength' must be an Integer")
          })
        })
        describe('format', () => {
          it('valid FORMATS.DATE', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .format(FORMATS.DATE)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  format: FORMATS.DATE,
                },
              },
              type: 'object',
            })
          })
          it('valid FORMATS.DATE_TIME', () => {
            expect(
              StringSchema()
                .prop('prop')
                .asString()
                .format(FORMATS.DATE_TIME)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  format: 'date-time',
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asNumber()
                .format('invalid')
            ).toThrow(
              "'format' must be one of relative-json-pointer, json-pointer, uuid, regex, ipv6, ipv4, hostname, email, url, uri-template, uri-reference, uri, time, date"
            )
          })
        })
        describe('pattern', () => {
          it('as a string', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .pattern('.*')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  pattern: '.*',
                },
              },
              type: 'object',
            })
          })
          it('as a regex', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .pattern(/.*/gi)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  pattern: '.*',
                },
              },
              type: 'object',
            })
          })
          it('invalid usage', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asNumber()
                .pattern('.*')
            ).toThrow("'prop' as 'number' doesn't accept 'pattern' option")
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asNumber()
                .pattern(1111)
            ).toThrow("'pattern' must be a string or a RegEx (e.g. /.*/)")
          })
        })
        describe('contentEncoding', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .contentEncoding('base64')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  contentEncoding: 'base64',
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asString()
                .contentEncoding(1000)
            ).toThrow("'contentEncoding' must be a string")
          })
        })

        describe('contentMediaType', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              StringSchema()
                .prop(prop)
                .asString()
                .contentMediaType('image/png')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                  contentMediaType: 'image/png',
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              StringSchema()
                .prop(prop)
                .asString()
                .contentMediaType(1000)
            ).toThrow("'contentMediaType' must be a string")
          })
        })
      })
    })
  })

  it.only('works', () => {
    // TODO LS https://json-schema.org/latest/json-schema-core.html#idExamples
    const stringProp = StringSchema()
      .asString()
      .id('http://foo.com/string')
      .title('A string')
      .description('A string desc')
      .pattern(/.*/g)
      .format('date-time')

    const schema = FluentSchema()
      .id('http://bar.com/object')
      .title('A object')
      .description('A object desc')
      .prop('name', stringProp)
      .pattern(/.*/g)
      .format('date-time')
      .valueOf()

    expect(schema).toEqual({
      $id: 'http://bar.com/object',
      $schema: 'http://json-schema.org/draft-07/schema#',
      description: 'A object desc',
      properties: {
        name: {
          $id: 'http://foo.com/string',
          description: 'A string desc',
          title: 'A string',
          type: 'string',
          format: 'date-time',
          pattern: '.*',
        },
      },
      title: 'A object',
      type: 'object',
    })
  })
})
