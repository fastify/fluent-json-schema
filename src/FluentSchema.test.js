const { FluentSchema, FORMATS } = require('./FluentSchema')

describe('FluentSchema', () => {
  describe('defaults', () => {
    it('is defined', () => {
      expect(FluentSchema().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {},
        properties: {},
        required: [],
        type: 'object',
      })
    })
  })

  describe('prop', () => {
    it('with type string', () => {
      expect(
        FluentSchema()
          .prop('prop')
          .valueOf().properties
      ).toEqual({
        prop: {
          type: 'string',
          $id: '#properties/prop',
        },
      })
    })

    it('with a nested object', () => {
      expect(
        FluentSchema()
          .prop('foo', FluentSchema().prop('bar'))
          .valueOf().properties.foo.properties
      ).toEqual({
        bar: {
          $id: '#properties/foo/properties/bar',
          type: 'string',
        },
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
      ).toEqual({ prop: { $id: '#properties/prop', type: 'number' } })
    })

    it('with a default', () => {
      expect(
        FluentSchema()
          .prop('prop')
          .asNumber()
          .default(3)
          .valueOf().properties
      ).toEqual({
        prop: { $id: '#properties/prop', type: 'number', default: 3 },
      })
    })
  })

  describe('definition', () => {
    it('sets a definition', () => {
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
          $id: '#definitions/foo',
          type: 'object',
          properties: {
            foo: {
              $id: '#definitions/foo/properties/foo',
              type: 'string',
            },
            bar: {
              $id: '#definitions/foo/properties/bar',
              type: 'string',
            },
          },
          required: [],
        },
      })
    })
  })

  describe('metadata:', () => {
    describe('id', () => {
      it('simple', () => {
        const value = 'id'
        expect(
          FluentSchema()
            .id(value)
            .valueOf().$id
        ).toEqual(value)
      })
      it('with props', () => {
        const id = 'customId'
        expect(
          FluentSchema()
            .prop(
              'foo',
              FluentSchema()
                .id(id)
                .prop('bar')
            )
            .valueOf().properties.foo.$id
        ).toEqual(id)
      })
    })

    it('title', () => {
      const value = 'title'
      expect(
        FluentSchema()
          .title(value)
          .valueOf().title
      ).toEqual(value)
    })

    it('description', () => {
      const value = 'description'
      expect(
        FluentSchema()
          .description(value)
          .valueOf().description
      ).toEqual(value)
    })

    describe('examples', () => {
      it('valid', () => {
        const value = ['example']
        expect(
          FluentSchema()
            .examples(value)
            .valueOf().examples
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
            definitions: {},
            properties: {
              prop: {
                $id: '#properties/prop',
                type: 'string',
                enum: ['ONE', 'TWO'],
              },
            },
            required: [],
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
            definitions: {},
            properties: {
              prop: {
                $id: '#properties/prop',
                type: 'string',
                const: 'ONE',
              },
            },
            required: [],
            type: 'object',
          })
        })
      })
    })
    describe('string', () => {
      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
            .asString()
            .valueOf().type
        ).toEqual('string')
      })

      it('returns a type to the root schema', () => {
        expect(
          FluentSchema()
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
              FluentSchema()
                .prop(prop)
                .asString()
                .minLength(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'string',
                  minLength: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .minLength('5')
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
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'string',
                  maxLength: 10,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .maxLength('5')
            ).toThrow("'maxLength' must be an Integer")
          })
        })
        describe('format', () => {
          it('valid', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asString()
                .format(FORMATS.DATE)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'string',
                  format: FORMATS.DATE,
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'string',
                  pattern: '.*',
                },
              },
              required: [],
              type: 'object',
            })
          })
          it.skip('as a regex', () => {
            const prop = 'prop'
            expect(
              FluentSchema()
                .prop(prop)
                .asString()
                .pattern(/.*/g)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'string',
                  pattern: '.*',
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .pattern('.*')
            ).toThrow("'prop' as 'number' doesn't accept 'pattern' option")
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
                .minimum(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'number',
                  minimum: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .minimum('5')
            ).toThrow("'minimum' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .minimum(5)
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
                .maximum(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'number',
                  maximum: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .maximum('5')
            ).toThrow("'maximum' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .maximum(5)
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
                .multipleOf(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'number',
                  multipleOf: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .multipleOf('5')
            ).toThrow("'multipleOf' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .multipleOf(5)
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
                .exclusiveMinimum(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'number',
                  exclusiveMinimum: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMinimum('5')
            ).toThrow("'exclusiveMinimum' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .exclusiveMinimum(5)
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
                .exclusiveMaximum(5)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                prop: {
                  $id: '#properties/prop',
                  type: 'number',
                  exclusiveMaximum: 5,
                },
              },
              required: [],
              type: 'object',
            })
          })
          it('invalid value', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asNumber()
                .exclusiveMaximum('5')
            ).toThrow("'exclusiveMaximum' must be an Integer")
          })
          it('invalid option', () => {
            const prop = 'prop'
            expect(() =>
              FluentSchema()
                .prop(prop)
                .asString()
                .exclusiveMaximum(5)
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: { type: 'number' },
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: { type: 'string' },
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: false,
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  contains: { type: 'string' },
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  additionalItems: false,
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  uniqueItems: true,
                },
              },
              required: [],
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
                .prop('list')
                .asArray()
                .items([FluentSchema().asNumber(), FluentSchema().asString()])
                .minItems(3)
                .valueOf()
            ).toEqual({
              $schema: 'http://json-schema.org/draft-07/schema#',
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  minItems: 3,
                },
              },
              required: [],
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
              definitions: {},
              properties: {
                list: {
                  $id: '#properties/list',
                  type: 'array',
                  items: [{ type: 'number' }, { type: 'string' }],
                  maxItems: 5,
                },
              },
              required: [],
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
    describe('anyOf', () => {
      it('sets two alternative', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .anyOf(
              FluentSchema()
                .prop('boolean')
                .asBoolean()
                .prop('string')
            )
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          definitions: {},
          properties: {
            prop: {
              $id: '#properties/prop',
              anyOf: [
                { $id: '#properties/boolean', type: 'boolean' },
                { $id: '#properties/string', type: 'string' },
              ],
            },
          },
          required: [],
          type: 'object',
        })
      })
    })

    describe('not', () => {
      it('add prop not', () => {
        expect(
          FluentSchema()
            .prop('prop')
            .not()
            .anyOf(
              FluentSchema()
                .prop('boolean')
                .asBoolean()
                .prop('number')
                .asNumber()
            )
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          definitions: {},
          properties: {
            prop: {
              $id: '#properties/prop',
              not: {
                anyOf: [
                  { $id: '#properties/boolean', type: 'boolean' },
                  { $id: '#properties/number', type: 'number' },
                ],
              },
            },
          },
          required: [],
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
        definitions: {},
        properties: {
          prop: {
            $id: '#properties/prop',
            type: 'string',
            maxLength: 5,
          },
        },
        if: {
          properties: {
            prop: {
              $id: '#if/properties/prop',
              type: 'string',
              maxLength: 5,
            },
          },
          required: [],
        },
        then: {
          properties: {
            extraProp: {
              $id: '#then/properties/extraProp',
              type: 'string',
            },
          },
          required: ['extraProp'],
        },
        required: [],
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
        definitions: {},
        properties: {
          prop: {
            $id: '#properties/prop',
            type: 'string',
            maxLength: 5,
          },
        },
        if: {
          properties: {
            prop: {
              $id: '#if/properties/prop',
              type: 'string',
              maxLength: 5,
            },
          },
          required: [],
        },
        then: {
          properties: {
            extraProp: {
              $id: '#then/properties/extraProp',
              type: 'string',
            },
          },
          required: ['extraProp'],
        },
        else: {
          properties: {
            elseProp: {
              $id: '#else/properties/elseProp',
              type: 'string',
            },
          },
          required: ['elseProp'],
        },
        required: [],
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
          .prop('country')
          .prop('city')
          .prop('zipcode')
      )
      .prop('username')
      .required()
      .prop('password')
      .required()
      .prop('address')
      .ref('#definitions/address')
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
          $id: '#definitions/address',
          properties: {
            country: {
              type: 'string',
              $id: '#definitions/address/properties/country',
            },
            city: {
              type: 'string',
              $id: '#definitions/address/properties/city',
            },
            zipcode: {
              type: 'string',
              $id: '#definitions/address/properties/zipcode',
            },
          },
          required: [],
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
          $id: '#properties/username',
        },
        password: {
          type: 'string',
          $id: '#properties/password',
        },
        address: {
          $ref: '#definitions/address',
        },
        age: {
          $id: '#properties/age',
          type: 'number',
        },
        role: {
          type: 'object',
          $id: 'http://foo.com/role',
          properties: {
            name: {
              type: 'string',
              $id: '#properties/role/properties/name',
            },
            permissions: {
              type: 'string',
              $id: '#properties/role/properties/permissions',
            },
          },
          required: [],
        },
      },
    })
  })
})
