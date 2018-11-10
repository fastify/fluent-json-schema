const { FluentSchema } = require('./FluentSchema')

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
    it('sets a prop with type string', () => {
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

    it('sets a prop with a nested object', () => {
      expect(
        FluentSchema()
          .prop('foo', FluentSchema().prop('bar'))
          .valueOf().properties.foo.properties
      ).toEqual({
        bar: {
          $id: '#properties/bar',
          type: 'string',
        },
      })
    })

    it('sets a prop with a $ref', () => {
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
              $id: '#properties/foo',
              type: 'string',
            },
            bar: {
              $id: '#properties/bar',
              type: 'string',
            },
          },
          required: [],
        },
      })
    })
  })

  describe('metadata:', () => {
    it('id', () => {
      const value = 'id'
      expect(
        FluentSchema()
          .id(value)
          .valueOf().$id
      ).toEqual(value)
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

      describe('length', () => {
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
      })
    })

    describe('asNumber', () => {
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

      describe('Numeric types', () => {
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
            ).toThrow("'prop' as 'number' doesn't accept 'minimum'")
          })
        })
      })
    })

    describe('asInteger', () => {
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

    describe('asBoolean', () => {
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

    describe('asArray', () => {
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
    })

    describe('asObject', () => {
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

    describe('asNull', () => {
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
              $id: '#properties/prop',
              type: 'string',
              maxLength: 5,
            },
          },
          required: [],
        },
        then: {
          properties: {
            extraProp: {
              $id: '#properties/extraProp',
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
              $id: '#properties/prop',
              type: 'string',
              maxLength: 5,
            },
          },
          required: [],
        },
        then: {
          properties: {
            extraProp: {
              $id: '#properties/extraProp',
              type: 'string',
            },
          },
          required: ['extraProp'],
        },
        else: {
          properties: {
            elseProp: {
              $id: '#properties/elseProp',
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

    //console.log(JSON.stringify(schema))
    expect(schema).toEqual({
      definitions: {
        address: {
          type: 'object',
          $id: '#definitions/address',
          properties: {
            country: {
              type: 'string',
              $id: '#properties/country',
            },
            city: {
              type: 'string',
              $id: '#properties/city',
            },
            zipcode: {
              type: 'string',
              $id: '#properties/zipcode',
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
              $id: '#properties/name',
            },
            permissions: {
              type: 'string',
              $id: '#properties/permissions',
            },
          },
          required: [],
        },
      },
    })
  })
})
