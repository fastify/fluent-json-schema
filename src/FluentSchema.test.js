const { FluentSchema, FORMATS } = require('./FluentSchema')

describe('FluentSchema', () => {
  it('defined', () => {
    expect(FluentSchema).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(FluentSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
      })
    })

    describe('generatedIds', () => {
      describe('properties', () => {
        it('true', () => {
          expect(
            FluentSchema({ generateIds: true })
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
                .prop(
                  'foo',
                  FluentSchema()
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
                .prop(
                  'foo',
                  FluentSchema()
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
            FluentSchema({ generateIds: true })
              .definition(
                'entity',
                FluentSchema()
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
              .definition(
                'entity',
                FluentSchema()
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
              .prop(
                'foo',
                FluentSchema()
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

  it.only('valueOf', () => {
    expect(
      FluentSchema()
        .asObject()
        .prop('foo', FluentSchema().asString())
        .valueOf()
    ).toEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
    })
  })

  describe('definition', () => {
    it('add', () => {
      expect(
        FluentSchema()
          .definition(
            'foo',
            FluentSchema()
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
        FluentSchema()
          .definition(
            'foo',
            FluentSchema()
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

  describe('keywords (any):', () => {
    describe('id', () => {
      const value = 'customId'
      it('to root', () => {
        expect(
          FluentSchema()
            .id(value)
            .valueOf().$id
        ).toEqual(value)
      })

      it('nested', () => {
        expect(
          FluentSchema()
            .prop(
              'foo',
              FluentSchema()
                .id(value)
                .prop('bar')
                .required()
            )
            .valueOf().properties.foo.$id
        ).toEqual(value)
      })

      it('adds to number prop', () => {
        expect(
          FluentSchema()
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
          FluentSchema()
            .title(value)
            .valueOf().title
        ).toEqual(value)
      })

      it('adds to number prop', () => {
        expect(
          FluentSchema()
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
          FluentSchema()
            .description(value)
            .valueOf().description
        ).toEqual(value)
      })

      it('add to number prop', () => {
        const value = 'description'
        expect(
          FluentSchema()
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
          FluentSchema()
            .examples(value)
            .valueOf().examples
        ).toEqual(value)
      })

      it('add to number prop', () => {
        const value = [123]
        expect(
          FluentSchema()
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
            FluentSchema()
              .examples(value)
              .valueOf().examples
        ).toThrow("'examples' must be an array e.g. ['1', 'one', 'foo']")
      })
    })

    describe('required', () => {
      it('valid', () => {
        const prop = 'foo'
        expect(
          FluentSchema()
            .prop(prop)
            .required()
            .valueOf().required
        ).toEqual([prop])
      })

      it('nested', () => {
        const prop = 'foo'
        const schema = FluentSchema()
          .prop(
            prop,
            FluentSchema()
              .asNumber()
              .required()
          )
          .valueOf()
        expect(schema.required).toEqual([prop])
        expect(schema.properties[prop]).toEqual({ type: 'number' })
      })

      it('deep nested', () => {
        const prop = 'foo'
        const schema = FluentSchema()
          .prop(
            prop,
            FluentSchema()
              .required()
              .prop('bar')
              .required()
          )
          .valueOf()
        expect(schema).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            foo: {
              properties: { bar: { type: 'string' } },
              required: ['bar'],
              type: 'object',
            },
          },
          required: ['foo'],
          type: 'object',
        })
      })

      it('multiple deep nested', () => {
        const schema = FluentSchema()
          .prop(
            'foo',
            FluentSchema()
              .required()
              .prop('bar')
              .required()
          )
          .prop(
            'prop',
            FluentSchema()
              .asString()
              .required()
          )
          .valueOf()
        expect(schema).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            foo: {
              properties: { bar: { type: 'string' } },
              required: ['bar'],
              type: 'object',
            },
            prop: { type: 'string' },
          },
          required: ['foo', 'prop'],
          type: 'object',
        })
      })
    })

    it('ref', () => {
      const value = 'description'
      expect(
        FluentSchema()
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
            FluentSchema()
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
            FluentSchema()
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
      it('adds a type to the root schema', () => {
        expect(
          FluentSchema()
            .asString()
            .valueOf().type
        ).toEqual('string')
      })
      // TODO LS after we return a typed schema we can't append a prop
      it.skip('sets a type to a prop', () => {
        expect(
          FluentSchema()
            .prop('bar')
            .asString()
            .pattern(/.*/g)
            .prop('foo')
            .valueOf().properties.value.type
        ).toEqual('string')
      })

      describe('keywords:', () => {
        describe('minLength', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
                .prop(prop)
                .asNumber()
                .pattern('.*')
            ).toThrow("'prop' as 'number' doesn't accept 'pattern' option")
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
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
              FluentSchema()
                .prop(prop)
                .asString()
                .contentMediaType(1000)
            ).toThrow("'contentMediaType' must be a string")
          })
        })
      })
    })
    describe('number', () => {
      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .asNumber()
            .valueOf().type
        ).toEqual('number')
      })

      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .prop('value')
            .asNumber()
            .valueOf().properties.value.type
        ).toEqual('number')
      })

      describe('keywords:', () => {
        describe('minimum', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asNumber()
                .minimum(5.1)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'number',
                  minimum: 5.1,
                },
              },
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .minimum('5.1')
            ).toThrow("'minimum' must be a Number")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .minimum(5.1)
            ).toThrow("'prop' as 'string' doesn't accept 'minimum' option")
          })
        })
        describe('maximum', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asNumber()
                .maximum(5.1)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'number',
                  maximum: 5.1,
                },
              },
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .maximum('5.1')
            ).toThrow("'maximum' must be a Number")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .maximum(5.1)
            ).toThrow("'prop' as 'string' doesn't accept 'maximum' option")
          })
        })
        describe('multipleOf', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asNumber()
                .multipleOf(5.1)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'number',
                  multipleOf: 5.1,
                },
              },
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .multipleOf('5.1')
            ).toThrow("'multipleOf' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .multipleOf(5.1)
            ).toThrow("'prop' as 'string' doesn't accept 'multipleOf' option")
          })
        })
        describe('exclusiveMinimum', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMinimum(5.1)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'number',
                  exclusiveMinimum: 5.1,
                },
              },
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMinimum('5.1')
            ).toThrow("'exclusiveMinimum' must be a Number")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .exclusiveMinimum(5.1)
            ).toThrow(
              "'prop' as 'string' doesn't accept 'exclusiveMinimum' option"
            )
          })
        })
        describe('exclusiveMaximum', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMaximum(5.1)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'number',
                  exclusiveMaximum: 5.1,
                },
              },
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMaximum('5.1')
            ).toThrow("'exclusiveMaximum' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .exclusiveMaximum(5.1)
            ).toThrow(
              "'prop' as 'string' doesn't accept 'exclusiveMaximum' option"
            )
          })
        })
      })
    })
    describe('integer', () => {
      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .asInteger()
            .valueOf().type
        ).toEqual('integer')
      })

      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .prop('value')
            .asInteger()
            .valueOf().properties.value.type
        ).toEqual('integer')
      })
    })
    describe('boolean', () => {
      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .asBoolean()
            .valueOf().type
        ).toEqual('boolean')
      })

      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .prop('value')
            .asBoolean()
            .valueOf().properties.value.type
        ).toEqual('boolean')
      })
    })
    describe('array', () => {
      it('returns a type from the root', () => {
        expect(
          FluentSchema()
            .asArray()
            .valueOf().type
        ).toEqual('array')
      })

      it('returns a type from the prop', () => {
        expect(
          FluentSchema()
            .prop('value')
            .asArray()
            .valueOf().properties.value.type
        ).toEqual('array')
      })

      describe('keywords:', () => {
        describe('items', () => {
          it('valid object', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items(FluentSchema().asNumber())
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: { type: 'number' },
                },
              },
              type: 'object',
            })
          })
          it('valid array', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items('')
            ).toThrow(
              "'items' must be a FluentSchema or an array of FluentSchema"
            )
          })
        })

        describe('additionalItems', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .additionalItems(FluentSchema().asString())
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: { type: 'string' },
                },
              },
              type: 'object',
            })
          })
          it('false', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .additionalItems(false)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: false,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .additionalItems('')
            ).toThrow("'additionalItems' must be a boolean or a FluentSchema")
          })
        })

        describe('contains', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .contains(FluentSchema().asString())
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  contains: { type: 'string' },
                },
              },
              type: 'object',
            })
          })
          it('false', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .additionalItems(false)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: false,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .additionalItems('')
            ).toThrow("'additionalItems' must be a boolean or a FluentSchema")
          })
        })

        describe('uniqueItems', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .uniqueItems(true)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  uniqueItems: true,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .uniqueItems('')
            ).toThrow("'uniqueItems' must be a boolean")
          })
        })

        describe('minItems', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .prop('prop')
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .minItems(3)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                prop: {
                  type: 'string',
                },
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  minItems: 3,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .minItems('')
            ).toThrow("'minItems' must be a integer")
          })
        })

        describe('maxItems', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .maxItems(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                list: {
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  maxItems: 5,
                },
              },
              type: 'object',
            })
          })
          it('invalid', () => {
            expect(() =>
              FluentSchema()
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .maxItems('')
            ).toThrow("'maxItems' must be a integer")
          })
        })
      })
    })
    describe('object', () => {
      it('sets a type object to the root', () => {
        expect(
          FluentSchema()
            .asObject()
            .valueOf().type
        ).toEqual('object')
      })

      it('sets a type object to the prop', () => {
        expect(
          FluentSchema()
            .prop('value')
            .asObject()
            .valueOf().properties.value.type
        ).toEqual('object')
      })

      describe('keywords:', () => {
        describe('properties', () => {
          it('with type string', () => {
            expect(
              FluentSchema()
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
                FluentSchema()
                  .prop('foo', FluentSchema().prop('bar'))
                  .valueOf().properties.foo.properties
              ).toEqual({
                bar: {
                  type: 'string',
                },
              })
            })

            it('string', () => {
              expect(
                FluentSchema()
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

          it('with a $ref', () => {
            expect(
              FluentSchema()
                .definition(
                  'foo',
                  FluentSchema()
                    .prop('foo')
                    .prop('bar')
                )
                .prop('prop')
                .ref('#definition/foo')
                .valueOf().properties
            ).toEqual({ prop: { $ref: '#definition/foo' } })
          })

          it('with a type', () => {
            expect(
              FluentSchema()
                .prop('prop')
                .asNumber()
                .valueOf().properties
            ).toEqual({ prop: { type: 'number' } })
          })

          it('with a default', () => {
            expect(
              FluentSchema()
                .prop('prop')
                .asNumber()
                .default(3)
                .valueOf().properties
            ).toEqual({
              prop: { type: 'number', default: 3 },
            })
          })

          it('with a description', () => {
            expect(
              FluentSchema()
                .title('Product')
                .prop('id')
                .description('The unique identifier for a product')
                .asNumber()
                .required()
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                id: {
                  description: 'The unique identifier for a product',
                  type: 'number',
                },
              },
              required: ['id'],
              title: 'Product',
              type: 'object',
            })
          })
        })

        describe('additionalProperties', () => {
          it('false', () => {
            const value = false
            expect(
              FluentSchema()
                .asObject()
                .additionalProperties(value)
                .prop('prop')
                .valueOf().additionalProperties
            ).toEqual(value)
          })

          it('object', () => {
            expect(
              FluentSchema()
                .asObject()
                .additionalProperties(FluentSchema().asString())
                .prop('prop')
                .valueOf().additionalProperties
            ).toEqual({ type: 'string' })
          })

          it('invalid', () => {
            const value = 'invalid'
            expect(() =>
              expect(
                FluentSchema()
                  .prop('prop')
                  .additionalProperties(value)
              ).toEqual(value)
            ).toThrow(
              "'additionalProperties' must be a boolean or a FluentSchema"
            )
          })
        })

        describe('maxProperties', () => {
          it('valid', () => {
            const value = 2
            expect(
              FluentSchema()
                .asObject()
                .maxProperties(value)
                .prop('prop')
                .valueOf().maxProperties
            ).toEqual(value)
          })

          it('invalid', () => {
            const value = 'invalid'
            expect(() =>
              expect(
                FluentSchema()
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
              FluentSchema()
                .asObject()
                .minProperties(value)
                .prop('prop')
                .valueOf().minProperties
            ).toEqual(value)
          })

          it('invalid', () => {
            const value = 'invalid'
            expect(() =>
              expect(
                FluentSchema()
                  .prop('prop')
                  .minProperties(value)
              ).toEqual(value)
            ).toThrow("'minProperties' must be a Integer")
          })
        })

        describe('patternProperties', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .asObject()
                .patternProperties({
                  '^fo.*$': FluentSchema().asString(),
                })
                .prop('foo')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              patternProperties: { '^fo.*$': { type: 'string' } },
              properties: { foo: { type: 'string' } },
              type: 'object',
            })
          })

          it('invalid', () => {
            const value = 'invalid'
            expect(() =>
              expect(
                FluentSchema()
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
              FluentSchema()
                .asObject()
                .dependencies({
                  foo: ['bar'],
                })
                .prop('foo')
                .prop('bar')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
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
              FluentSchema()
                .asObject()
                .dependencies({
                  foo: FluentSchema()
                    .prop('bar')
                    .asNumber(),
                })
                .prop('foo')
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              dependencies: {
                foo: {
                  properties: {
                    bar: { type: 'number' },
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
                FluentSchema()
                  .prop('prop')
                  .patternProperties(value)
              ).toEqual(value)
            ).toThrow(
              "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': FluentSchema().asString() }"
            )
          })
        })

        describe('propertyNames', () => {
          it('valid', () => {
            expect(
              FluentSchema()
                .asObject()
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
                FluentSchema()
                  .prop('prop')
                  .propertyNames(value)
              ).toEqual(value)
            ).toThrow("'propertyNames' must be a FluentSchema")
          })
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
          FluentSchema()
            .prop('value')
            .asNull()
            .valueOf().properties.value.type
        ).toEqual('null')
      })
    })
  })

  describe('combining keywords:', () => {
    describe('allOf', () => {
      it('two types', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .allOf([FluentSchema().asBoolean(), FluentSchema().asString()])
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
          FluentSchema()
            .prop('prop')
            .allOf([
              FluentSchema()
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
            return FluentSchema()
              .prop('prop')
              .allOf('test')
          }).toThrow(
            "'allOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return FluentSchema()
              .prop('prop')
              .allOf(['test'])
          }).toThrow(
            "'allOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('anyOf', () => {
      it('two types', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .anyOf([FluentSchema().asBoolean(), FluentSchema().asString()])
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
          FluentSchema()
            .prop('prop')
            .anyOf([
              FluentSchema()
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
            return FluentSchema()
              .prop('prop')
              .anyOf('test')
          }).toThrow(
            "'anyOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return FluentSchema()
              .prop('prop')
              .anyOf(['test'])
          }).toThrow(
            "'anyOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('oneOf', () => {
      it('two types', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .oneOf([FluentSchema().asBoolean(), FluentSchema().asString()])
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
          FluentSchema()
            .prop('prop')
            .oneOf([
              FluentSchema()
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
            return FluentSchema()
              .prop('prop')
              .oneOf('test')
          }).toThrow(
            "'oneOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return FluentSchema()
              .prop('prop')
              .oneOf(['test'])
          }).toThrow(
            "'oneOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('not', () => {
      it('add prop not', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .not()
            .anyOf([
              FluentSchema()
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
        FluentSchema()
          .prop('prop')
          .maxLength(5)
          .ifThen(
            FluentSchema()
              .prop('prop')
              .maxLength(5),
            FluentSchema()
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
        FluentSchema()
          .prop('prop')
          .maxLength(5)
          .ifThenElse(
            FluentSchema()
              .prop('prop')
              .maxLength(5),
            FluentSchema()
              .prop('extraProp')
              .required(),
            FluentSchema()
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
    const schema = FluentSchema()
      .id('http://foo.com/user')
      .title('A User')
      .description('A User desc')
      .definition(
        'address',
        FluentSchema()
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
        FluentSchema()
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
