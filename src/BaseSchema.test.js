'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { BaseSchema } = require('./BaseSchema')
const S = require('./FluentJSONSchema')

describe('BaseSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(BaseSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      BaseSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  it('Expose legacy plain boolean', () => {
    assert.notStrictEqual(BaseSchema().isFluentSchema, undefined)
  })

  it('Expose plain boolean', () => {
    assert.notStrictEqual(BaseSchema().isFluentJSONSchema, undefined)
  })

  describe('factory', () => {
    it('without params', () => {
      assert.deepStrictEqual(BaseSchema().valueOf(), {})
    })

    describe('factory', () => {
      it('default', () => {
        const title = 'title'
        assert.deepStrictEqual(BaseSchema().title(title).valueOf(), {
          title
        })
      })

      it('override', () => {
        const title = 'title'
        assert.deepStrictEqual(
          BaseSchema({ factory: BaseSchema }).title(title).valueOf(),
          {
            title
          }
        )
      })
    })
  })

  describe('keywords (any):', () => {
    describe('id', () => {
      const value = 'customId'
      it('to root', () => {
        assert.strictEqual(BaseSchema().id(value).valueOf().$id, value)
      })

      it('nested', () => {
        assert.strictEqual(
          S.object().prop('foo', BaseSchema().id(value).required()).valueOf()
            .properties.foo.$id,
          value
        )
      })

      it('invalid', () => {
        assert.throws(
          () => BaseSchema().id(''),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              'id should not be an empty fragment <#> or an empty string <> (e.g. #myId)'
        )
      })
    })

    describe('title', () => {
      const value = 'title'
      it('adds to root', () => {
        assert.strictEqual(BaseSchema().title(value).valueOf().title, value)
      })
    })

    describe('description', () => {
      it('add to root', () => {
        const value = 'description'
        assert.strictEqual(
          BaseSchema().description(value).valueOf().description,
          value
        )
      })
    })

    describe('examples', () => {
      it('adds to root', () => {
        const value = ['example']
        assert.deepStrictEqual(
          BaseSchema().examples(value).valueOf().examples,
          value
        )
      })

      it('invalid', () => {
        const value = 'examples'
        assert.throws(
          () => BaseSchema().examples(value).valueOf().examples,
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'examples' must be an array e.g. ['1', 'one', 'foo']"
        )
      })
    })

    describe('required', () => {
      it('in line valid', () => {
        const prop = 'foo'
        assert.deepStrictEqual(
          S.object().prop(prop).required().valueOf().required,
          [prop]
        )
      })
      it('nested valid', () => {
        const prop = 'foo'
        assert.deepStrictEqual(
          S.object().prop(prop, S.string().required().minLength(3)).valueOf()
            .required,
          [prop]
        )
      })

      describe('unique keys on required', () => {
        it('repeated calls to required()', () => {
          assert.throws(
            () => S.object().prop('A', S.string()).required().required(),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'required' has repeated keys, check your calls to .required()"
          )
        })
        it('repeated props on appendRequired()', () => {
          assert.throws(
            () =>
              S.object()
                .prop('A', S.string().required())
                .prop('A', S.string().required()),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'required' has repeated keys, check your calls to .required()"
          )
        })
      })

      it('root-level required', () => {
        assert.throws(
          () => S.object().required().valueOf(),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'required' has called on root-level schema, check your calls to .required()"
        )
      })

      describe('array', () => {
        it('simple', () => {
          const required = ['foo', 'bar']
          assert.deepStrictEqual(S.required(required).valueOf(), {
            required
          })
        })
        it('nested', () => {
          assert.deepStrictEqual(
            S.object()
              .prop('foo', S.string())
              .prop('bar', S.string().required())
              .required(['foo'])
              .valueOf(),
            {
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: { bar: { type: 'string' }, foo: { type: 'string' } },
              required: ['bar', 'foo'],
              type: 'object'
            }
          )
        })
      })
    })

    describe('deprecated', () => {
      it('valid', () => {
        assert.strictEqual(
          BaseSchema().deprecated(true).valueOf().deprecated,
          true
        )
      })
      it('invalid', () => {
        assert.throws(
          () =>
            BaseSchema().deprecated('somethingNotBoolean').valueOf().deprecated,
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'deprecated' must be a boolean value"
        )
      })
      it('valid with no value', () => {
        assert.strictEqual(BaseSchema().deprecated().valueOf().deprecated, true)
      })
      it('can be set to false', () => {
        assert.strictEqual(
          BaseSchema().deprecated(false).valueOf().deprecated,
          false
        )
      })
      it('property', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('foo', S.string())
            .prop('bar', S.string().deprecated())
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              bar: { type: 'string', deprecated: true },
              foo: { type: 'string' }
            },
            type: 'object'
          }
        )
      })
      it('object', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('foo', S.string())
            .prop(
              'bar',
              S.object()
                .deprecated()
                .prop('raz', S.string())
                .prop('iah', S.number())
            )
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              foo: { type: 'string' },
              bar: {
                type: 'object',
                deprecated: true,
                properties: {
                  raz: { $id: undefined, type: 'string' },
                  iah: { $id: undefined, type: 'number' }
                }
              }
            },
            type: 'object'
          }
        )
      })
      it('object property', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('foo', S.string())
            .prop(
              'bar',
              S.object()
                .prop('raz', S.string().deprecated())
                .prop('iah', S.number())
            )
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              foo: { type: 'string' },
              bar: {
                type: 'object',
                properties: {
                  raz: { $id: undefined, type: 'string', deprecated: true },
                  iah: { $id: undefined, type: 'number' }
                }
              }
            },
            type: 'object'
          }
        )
      })
      it('array', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('foo', S.string())
            .prop('bar', S.array().deprecated().items(S.number()))
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: {
                type: 'array',
                deprecated: true,
                items: { type: 'number' }
              }
            }
          }
        )
      })
      it('array item', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('foo', S.string())
            .prop(
              'bar',
              S.array().items([
                S.object().prop('zoo', S.string()).prop('biz', S.string()),
                S.object()
                  .deprecated()
                  .prop('zal', S.string())
                  .prop('boz', S.string())
              ])
            )
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              foo: { type: 'string' },
              bar: {
                type: 'array',
                items: [
                  {
                    type: 'object',
                    properties: {
                      zoo: { type: 'string' },
                      biz: { type: 'string' }
                    }
                  },
                  {
                    type: 'object',
                    deprecated: true,
                    properties: {
                      zal: { type: 'string' },
                      boz: { type: 'string' }
                    }
                  }
                ]
              }
            }
          }
        )
      })
    })

    describe('enum', () => {
      it('valid', () => {
        const value = ['VALUE']
        assert.deepStrictEqual(BaseSchema().enum(value).valueOf().enum, value)
      })

      it('invalid', () => {
        const value = 'VALUE'
        assert.throws(
          () => BaseSchema().enum(value).valueOf().examples,
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'enums' must be an array with at least an element e.g. ['1', 'one', 'foo']"
        )
      })
    })

    describe('const', () => {
      it('valid', () => {
        const value = 'VALUE'
        assert.strictEqual(BaseSchema().const(value).valueOf().const, value)
      })
    })

    describe('default', () => {
      it('valid', () => {
        const value = 'VALUE'
        assert.strictEqual(BaseSchema().default(value).valueOf().default, value)
      })
    })

    describe('readOnly', () => {
      it('valid', () => {
        assert.strictEqual(BaseSchema().readOnly(true).valueOf().readOnly, true)
      })
      it('valid with no value', () => {
        assert.strictEqual(BaseSchema().readOnly().valueOf().readOnly, true)
      })
      it('can be set to false', () => {
        assert.strictEqual(
          BaseSchema().readOnly(false).valueOf().readOnly,
          false
        )
      })
    })

    describe('writeOnly', () => {
      it('valid', () => {
        assert.strictEqual(
          BaseSchema().writeOnly(true).valueOf().writeOnly,
          true
        )
      })
      it('valid with no value', () => {
        assert.strictEqual(BaseSchema().writeOnly().valueOf().writeOnly, true)
      })
      it('can be set to false', () => {
        assert.strictEqual(
          BaseSchema().writeOnly(false).valueOf().writeOnly,
          false
        )
      })
    })

    describe('ref', () => {
      it('base', () => {
        const ref = 'myRef'
        assert.deepStrictEqual(BaseSchema().ref(ref).valueOf(), { $ref: ref })
      })

      it('S', () => {
        const ref = 'myRef'
        assert.deepStrictEqual(S.ref(ref).valueOf(), {
          $ref: ref
        })
      })
    })
  })

  describe('combining keywords:', () => {
    describe('allOf', () => {
      it('base', () => {
        assert.deepStrictEqual(
          BaseSchema()
            .allOf([BaseSchema().id('foo')])
            .valueOf(),
          {
            allOf: [{ $id: 'foo' }]
          }
        )
      })
      it('S', () => {
        assert.deepStrictEqual(S.allOf([S.id('foo')]).valueOf(), {
          allOf: [{ $id: 'foo' }]
        })
      })
      describe('invalid', () => {
        it('not an array', () => {
          assert.throws(
            () => BaseSchema().allOf('test'),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'allOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          assert.throws(
            () => BaseSchema().allOf(['test']),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'allOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('anyOf', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          BaseSchema()
            .anyOf([BaseSchema().id('foo')])
            .valueOf(),
          {
            anyOf: [{ $id: 'foo' }]
          }
        )
      })
      it('S nested', () => {
        assert.deepStrictEqual(
          S.object()
            .prop('prop', S.anyOf([S.string(), S.null()]))
            .valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: {
              prop: { anyOf: [{ type: 'string' }, { type: 'null' }] }
            },
            type: 'object'
          }
        )
      })

      it('S nested required', () => {
        assert.deepStrictEqual(
          S.object().prop('prop', S.anyOf([]).required()).valueOf(),
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            properties: { prop: {} },
            required: ['prop'],
            type: 'object'
          }
        )
      })

      describe('invalid', () => {
        it('not an array', () => {
          assert.throws(
            () => BaseSchema().anyOf('test'),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'anyOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          assert.throws(
            () => BaseSchema().anyOf(['test']),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'anyOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('oneOf', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          BaseSchema()
            .oneOf([BaseSchema().id('foo')])
            .valueOf(),
          {
            oneOf: [{ $id: 'foo' }]
          }
        )
      })
      describe('invalid', () => {
        it('not an array', () => {
          assert.throws(
            () => BaseSchema().oneOf('test'),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'oneOf' must be a an array of FluentSchema rather than a 'string'"
          )
        })
        it('not an array of FluentSchema', () => {
          assert.throws(
            () => BaseSchema().oneOf(['test']),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'oneOf' must be a an array of FluentSchema rather than a 'object'"
          )
        })
      })
    })

    describe('not', () => {
      describe('valid', () => {
        it('simple', () => {
          assert.deepStrictEqual(
            BaseSchema().not(S.string().maxLength(10)).valueOf(),
            {
              not: { type: 'string', maxLength: 10 }
            }
          )
        })

        it('complex', () => {
          assert.deepStrictEqual(
            BaseSchema()
              .not(BaseSchema().anyOf([BaseSchema().id('foo')]))
              .valueOf(),
            {
              not: { anyOf: [{ $id: 'foo' }] }
            }
          )
        })

        // .prop('notTypeKey', S.not(S.string().maxLength(10))) => notTypeKey: { not: { type: 'string', "maxLength": 10 } }
      })

      it('invalid', () => {
        assert.throws(
          () => BaseSchema().not(undefined),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'not' must be a BaseSchema"
        )
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

        assert.deepStrictEqual(schema, {
          $id: 'http://foo.com/user',
          title: 'A User',
          if: { $id: 'http://foo.com/user' },
          then: { description: 'A User desc' }
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

        assert.deepStrictEqual(schema, {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          $id: 'http://foo.com/user',
          title: 'A User',
          properties: { bar: {}, foo: {} },
          if: { properties: { foo: { $id: undefined, type: 'null' } } },
          then: {
            properties: { bar: { $id: undefined, type: 'string' } },
            required: ['bar']
          }
        })
      })
    })

    describe('invalid', () => {
      it('ifClause', () => {
        assert.throws(
          () =>
            BaseSchema().ifThen(
              undefined,
              BaseSchema().description('A User desc')
            ),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'ifClause' must be a BaseSchema"
        )
      })
      it('thenClause', () => {
        assert.throws(
          () => BaseSchema().ifThen(BaseSchema().id('id'), undefined),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'thenClause' must be a BaseSchema"
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

        assert.deepStrictEqual(schema, {
          $id: 'http://foo.com/user',
          title: 'A User',
          if: { $id: 'http://foo.com/user' },
          then: { description: 'then' },
          else: { description: 'else' }
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

        assert.deepStrictEqual(schema, {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          $id: 'http://foo.com/user',
          title: 'A User',
          properties: { bar: {}, foo: {} },
          if: { properties: { foo: { $id: undefined, type: 'null' } } },
          then: {
            properties: { bar: { $id: undefined, type: 'string' } },
            required: ['bar']
          },
          else: { properties: { bar: { $id: undefined, type: 'string' } } }
        })
      })

      describe('invalid', () => {
        it('ifClause', () => {
          assert.throws(
            () =>
              BaseSchema().ifThenElse(
                undefined,
                BaseSchema().description('then'),
                BaseSchema().description('else')
              ),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message === "'ifClause' must be a BaseSchema"
          )
        })
        it('thenClause', () => {
          assert.throws(
            () =>
              BaseSchema().ifThenElse(
                BaseSchema().id('id'),
                undefined,
                BaseSchema().description('else')
              ),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message === "'thenClause' must be a BaseSchema"
          )
        })
        it('elseClause', () => {
          assert.throws(
            () =>
              BaseSchema().ifThenElse(
                BaseSchema().id('id'),
                BaseSchema().description('then'),
                undefined
              ),
            (err) =>
              err instanceof S.FluentSchemaError &&
              err.message ===
                "'elseClause' must be a BaseSchema or a false boolean value"
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

      assert.deepStrictEqual(schema, {
        title: 'foo',
        customKeyword: true
      })
    })
  })
})
