const { BaseSchema } = require('./BaseSchema')
const S = require('./FluentJSONSchema')

describe('BaseSchema', () => {
  it('defined', () => {
    expect(BaseSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(BaseSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  it('Expose legacy plain boolean', () => {
    expect(BaseSchema().isFluentSchema).toBeDefined()
  })

  it('Expose plain boolean', () => {
    expect(BaseSchema().isFluentJSONSchema).toBeDefined()
  })

  describe('factory', () => {
    it('without params', () => {
      expect(BaseSchema().valueOf()).toEqual({})
    })

    describe('factory', () => {
      it('default', () => {
        const title = 'title'
        expect(
          BaseSchema()
            .title(title)
            .valueOf()
        ).toEqual({
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
          title,
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

      it('nested', () => {
        expect(
          S.object()
            .prop(
              'foo',
              BaseSchema()
                .id(value)
                .required()
            )
            .valueOf().properties.foo.$id
        ).toEqual(value)
      })

      it('invalid', () => {
        expect(() => {
          BaseSchema().id('')
        }).toThrowError(
          new S.FluentSchemaError(
            'id should not be an empty fragment <#> or an empty string <> (e.g. #myId)'
          )
        )
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
        ).toThrowError(
          new S.FluentSchemaError(
            "'examples' must be an array e.g. ['1', 'one', 'foo']"
          )
        )
      })
    })

    describe('required', () => {
      it('in line valid', () => {
        const prop = 'foo'
        expect(
          S.object()
            .prop(prop)
            .required()
            .valueOf().required
        ).toEqual([prop])
      })
      it('nested valid', () => {
        const prop = 'foo'
        expect(
          S.object()
            .prop(
              prop,
              S.string()
                .required()
                .minLength(3)
            )
            .valueOf().required
        ).toEqual([prop])
      })

      describe('unique keys on required', () => {
        it('repeated calls to required()', () => {
          expect(() => {
            return S.object()
            .prop("A", S.string()).required().required()
          }).toThrowError(
            new S.FluentSchemaError(
              "'required' has repeated keys, check your calls to require()"
            )
          )
        })
        it('repeated props on appendRequired()', () => {
          expect(() => {
            return S.object()
            .prop("A", S.string().required())
            .prop("A", S.string().required())
          }).toThrowError(
            new S.FluentSchemaError(
              "'required' has repeated keys, check your calls to require()"
            )
          )
        })
      })

      describe('array', () => {
        it('simple', () => {
          const required = ['foo', 'bar']
          expect(S.required(required).valueOf()).toEqual({
            required,
          })
        })
        it('nested', () => {
          expect(
            S.object()
              .prop('foo', S.string())
              .prop('bar', S.string().required())
              .required(['foo'])
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: { bar: { type: 'string' }, foo: { type: 'string' } },
            required: ['bar', 'foo'],
            type: 'object',
          })
        })
      })
    })

    describe('enum', () => {
      it('valid', () => {
        const value = ['VALUE']
        expect(
          BaseSchema()
            .enum(value)
            .valueOf().enum
        ).toEqual(value)
      })

      it('invalid', () => {
        const value = 'VALUE'
        expect(
          () =>
            BaseSchema()
              .enum(value)
              .valueOf().examples
        ).toThrowError(
          new S.FluentSchemaError(
            "'enums' must be an array with at least an element e.g. ['1', 'one', 'foo']"
          )
        )
      })
    })

    describe('const', () => {
      it('valid', () => {
        const value = 'VALUE'
        expect(
          BaseSchema()
            .const(value)
            .valueOf().const
        ).toEqual(value)
      })
    })

    describe('default', () => {
      it('valid', () => {
        const value = 'VALUE'
        expect(
          BaseSchema()
            .default(value)
            .valueOf().default
        ).toEqual(value)
      })
    })

    describe('readOnly', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .readOnly(true)
            .valueOf().readOnly
        ).toEqual(true)
      })
      it('valid with no value', () => {
        expect(
          BaseSchema()
            .readOnly()
            .valueOf().readOnly
        ).toEqual(true)
      })
      it('can be set to false', () => {
        expect(
          BaseSchema()
            .readOnly(false)
            .valueOf().readOnly
        ).toEqual(false)
      })
    })

    describe('writeOnly', () => {
      it('valid', () => {
        expect(
          BaseSchema()
            .writeOnly(true)
            .valueOf().writeOnly
        ).toEqual(true)
      })
      it('valid with no value', () => {
        expect(
          BaseSchema()
            .writeOnly()
            .valueOf().writeOnly
        ).toEqual(true)
      })
      it('can be set to false', () => {
        expect(
          BaseSchema()
            .writeOnly(false)
            .valueOf().writeOnly
        ).toEqual(false)
      })
    })

    describe('ref', () => {
      it('base', () => {
        const ref = 'myRef'
        expect(
          BaseSchema()
            .ref(ref)
            .valueOf()
        ).toEqual({ $ref: ref })
      })

      it('S', () => {
        const ref = 'myRef'
        expect(S.ref(ref).valueOf()).toEqual({
          $ref: ref,
        })
      })
    })
  })

  describe('combining keywords:', () => {
    describe('allOf', () => {
      it('base', () => {
        expect(
          BaseSchema()
            .allOf([BaseSchema().id('foo')])
            .valueOf()
        ).toEqual({
          allOf: [{ $id: 'foo' }],
        })
      })
      it('S', () => {
        expect(S.allOf([S.id('foo')]).valueOf()).toEqual({
          allOf: [{ $id: 'foo' }],
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().allOf('test')
          }).toThrowError(
            new S.FluentSchemaError(
              "'allOf' must be a an array of FluentSchema rather than a 'string'"
            )
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().allOf(['test'])
          }).toThrowError(
            new S.FluentSchemaError(
              "'allOf' must be a an array of FluentSchema rather than a 'object'"
            )
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
          anyOf: [{ $id: 'foo' }],
        })
      })
      it('S nested', () => {
        expect(
          S.object()
            .prop('prop', S.anyOf([S.string(), S.null()]))
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
          type: 'object',
        })
      })

      it('S nested required', () => {
        expect(
          S.object()
            .prop('prop', S.anyOf([]).required())
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: { prop: {} },
          required: ['prop'],
          type: 'object',
        })
      })

      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().anyOf('test')
          }).toThrowError(
            new S.FluentSchemaError(
              "'anyOf' must be a an array of FluentSchema rather than a 'string'"
            )
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().anyOf(['test'])
          }).toThrowError(
            new S.FluentSchemaError(
              "'anyOf' must be a an array of FluentSchema rather than a 'object'"
            )
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
          oneOf: [{ $id: 'foo' }],
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          expect(() => {
            return BaseSchema().oneOf('test')
          }).toThrowError(
            new S.FluentSchemaError(
              "'oneOf' must be a an array of FluentSchema rather than a 'string'"
            )
          )
        })
        it('not an array of FluentSchema', () => {
          expect(() => {
            return BaseSchema().oneOf(['test'])
          }).toThrowError(
            new S.FluentSchemaError(
              "'oneOf' must be a an array of FluentSchema rather than a 'object'"
            )
          )
        })
      })
    })

    describe('not', () => {
      describe('valid', () => {
        it('simple', () => {
          expect(
            BaseSchema()
              .not(S.string().maxLength(10))
              .valueOf()
          ).toEqual({
            not: { type: 'string', maxLength: 10 },
          })
        })

        it('complex', () => {
          expect(
            BaseSchema()
              .not(BaseSchema().anyOf([BaseSchema().id('foo')]))
              .valueOf()
          ).toEqual({
            not: { anyOf: [{ $id: 'foo' }] },
          })
        })

        // .prop('notTypeKey', S.not(S.string().maxLength(10))) => notTypeKey: { not: { type: 'string', "maxLength": 10 } }
      })

      it('invalid', () => {
        expect(() => {
          BaseSchema().not(undefined)
        }).toThrowError(new S.FluentSchemaError("'not' must be a BaseSchema"))
      })
    })
  })

  describe('ifThen', () => {
    describe('valid', () => {
      it('returns a schema', () => {
        const id = 'http://foo.com/user'
        const schema = BaseSchema()
          .id(id)
          .title('A User')
          .ifThen(BaseSchema().id(id), BaseSchema().description('A User desc'))
          .valueOf()

        expect(schema).toEqual({
          $id: 'http://foo.com/user',
          title: 'A User',
          if: { $id: 'http://foo.com/user' },
          then: { description: 'A User desc' },
        })
      })

      it('appends a prop after the clause', () => {
        const id = 'http://foo.com/user'
        const schema = S.object()
          .id(id)
          .title('A User')
          .prop('bar')
          .ifThen(
            S.object().prop('foo', S.null()),
            S.object().prop('bar', S.string().required())
          )
          .prop('foo')
          .valueOf()

        expect(schema).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          $id: 'http://foo.com/user',
          title: 'A User',
          properties: { bar: {}, foo: {} },
          if: { properties: { foo: { type: 'null' } } },
          then: { properties: { bar: { type: 'string' } }, required: ['bar'] },
        })
      })
    })

    describe('invalid', () => {
      it('ifClause', () => {
        expect(() => {
          BaseSchema().ifThen(
            undefined,
            BaseSchema().description('A User desc')
          )
        }).toThrowError(
          new S.FluentSchemaError("'ifClause' must be a BaseSchema")
        )
      })
      it('thenClause', () => {
        expect(() => {
          BaseSchema().ifThen(BaseSchema().id('id'), undefined)
        }).toThrowError(
          new S.FluentSchemaError("'thenClause' must be a BaseSchema")
        )
      })
    })
  })

  describe('ifThenElse', () => {
    describe('valid', () => {
      it('returns a schema', () => {
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
          $id: 'http://foo.com/user',
          title: 'A User',
          if: { $id: 'http://foo.com/user' },
          then: { description: 'then' },
          else: { description: 'else' },
        })
      })

      it('appends a prop after the clause', () => {
        const id = 'http://foo.com/user'
        const schema = S.object()
          .id(id)
          .title('A User')
          .prop('bar')
          .ifThenElse(
            S.object().prop('foo', S.null()),
            S.object().prop('bar', S.string().required()),
            S.object().prop('bar', S.string())
          )
          .prop('foo')
          .valueOf()

        expect(schema).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          $id: 'http://foo.com/user',
          title: 'A User',
          properties: { bar: {}, foo: {} },
          if: { properties: { foo: { type: 'null' } } },
          then: { properties: { bar: { type: 'string' } }, required: ['bar'] },
          else: { properties: { bar: { type: 'string' } } },
        })
      })

      describe('invalid', () => {
        it('ifClause', () => {
          expect(() => {
            BaseSchema().ifThenElse(
              undefined,
              BaseSchema().description('then'),
              BaseSchema().description('else')
            )
          }).toThrowError(
            new S.FluentSchemaError("'ifClause' must be a BaseSchema")
          )
        })
        it('thenClause', () => {
          expect(() => {
            BaseSchema().ifThenElse(
              BaseSchema().id('id'),
              undefined,
              BaseSchema().description('else')
            )
          }).toThrowError(
            new S.FluentSchemaError("'thenClause' must be a BaseSchema")
          )
        })
        it('elseClause', () => {
          expect(() => {
            BaseSchema().ifThenElse(
              BaseSchema().id('id'),
              BaseSchema().description('then'),
              undefined
            )
          }).toThrowError(
            new S.FluentSchemaError(
              "'elseClause' must be a BaseSchema or a false boolean value"
            )
          )
        })
      })
    })
  })

  describe('raw', () => {
    it('allows to add a custom attribute', () => {
      const schema = BaseSchema()
        .title('foo')
        .raw({ customKeyword: true })
        .valueOf()

      expect(schema).toEqual({
        title: 'foo',
        customKeyword: true,
      })
    })
  })
})
