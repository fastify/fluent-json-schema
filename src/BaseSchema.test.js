const { BaseSchema } = require('./BaseSchema')
const { FluentSchema } = require('./FluentSchema')

describe('BaseSchema', () => {
  it('defined', () => {
    expect(BaseSchema).toBeDefined()
  })

  describe('constructor', () => {
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
          FluentSchema()
            .object()
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
        }).toThrow(
          'id should not be an empty fragment <#> or an empty string <> (e.g. #myId)'
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
        ).toThrow("'examples' must be an array e.g. ['1', 'one', 'foo']")
      })
    })

    describe('required', () => {
      it('in line valid', () => {
        const prop = 'foo'
        expect(
          FluentSchema()
            .object()
            .prop(prop)
            .required()
            .valueOf().required
        ).toEqual([prop])
      })
      it('nested valid', () => {
        const prop = 'foo'
        expect(
          FluentSchema()
            .object()
            .prop(
              prop,
              FluentSchema()
                .string()
                .required()
            )
            .valueOf().required
        ).toEqual([prop])
      })

      describe('array', () => {
        it('simple', () => {
          const required = ['foo', 'bar']
          expect(
            FluentSchema()
              .required(required)
              .valueOf()
          ).toEqual({
            $schema: 'http://json-schema.org/draft-07/schema#',
            required,
          })
        })
        it('nested', () => {
          expect(
            FluentSchema()
              .object()
              .prop('foo')
              .prop('bar', FluentSchema().required())
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
        ).toThrow(
          "'enums' must be an array with at least an element e.g. ['1', 'one', 'foo']"
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

    describe('ref', () => {
      it('ref', () => {
        const ref = 'myRef'
        expect(
          BaseSchema()
            .ref(ref)
            .valueOf()
        ).toEqual({ $ref: ref })
      })

      it('ref', () => {
        const ref = 'myRef'
        expect(
          FluentSchema()
            .ref(ref)
            .valueOf()
        ).toEqual({
          $schema: 'http://json-schema.org/draft-07/schema#',
          $ref: ref,
        })
      })
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
          not: { anyOf: [{ $id: 'foo' }] },
        })
      })

      it('invalid', () => {
        expect(() => {
          BaseSchema().not(undefined)
        }).toThrow("'not' must be a BaseSchema")
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
        $id: 'http://foo.com/user',
        title: 'A User',
        if: { $id: 'http://foo.com/user' },
        then: { description: 'A User desc' },
      })
    })
    describe('invalid', () => {
      it('ifClause', () => {
        expect(() => {
          BaseSchema().ifThen(
            undefined,
            BaseSchema().description('A User desc')
          )
        }).toThrow("'ifClause' must be a BaseSchema")
      })
      it('thenClause', () => {
        expect(() => {
          BaseSchema().ifThen(BaseSchema().id('id'), undefined)
        }).toThrow("'thenClause' must be a BaseSchema")
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
        $id: 'http://foo.com/user',
        title: 'A User',
        if: { $id: 'http://foo.com/user' },
        then: { description: 'then' },
        else: { description: 'else' },
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
        }).toThrow("'ifClause' must be a BaseSchema")
      })
      it('thenClause', () => {
        expect(() => {
          BaseSchema().ifThenElse(
            BaseSchema().id('id'),
            undefined,
            BaseSchema().description('else')
          )
        }).toThrow("'thenClause' must be a BaseSchema")
      })
      it('elseClause', () => {
        expect(() => {
          BaseSchema().ifThenElse(
            BaseSchema().id('id'),
            BaseSchema().description('then'),
            undefined
          )
        }).toThrow("'elseClause' must be a BaseSchema")
      })
    })
  })
})
