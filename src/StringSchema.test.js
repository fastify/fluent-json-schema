'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

const { StringSchema, FORMATS } = require('./StringSchema')
const S = require('./FluentJSONSchema')

describe('StringSchema', () => {
  it('defined', () => {
    assert.notStrictEqual(StringSchema, undefined)
  })

  it('Expose symbol', () => {
    assert.notStrictEqual(
      StringSchema()[Symbol.for('fluent-schema-object')],
      undefined
    )
  })

  describe('constructor', () => {
    it('without params', () => {
      assert.deepStrictEqual(StringSchema().valueOf(), {
        type: 'string'
      })
    })

    it('from S', () => {
      assert.deepStrictEqual(S.string().valueOf(), {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string'
      })
    })
  })

  describe('keywords:', () => {
    describe('minLength', () => {
      it('valid', () => {
        const schema = S.object()
          .prop('prop', StringSchema().minLength(5))
          .valueOf()
        assert.deepStrictEqual(schema, {
          $schema: 'http://json-schema.org/draft-07/schema#',
          properties: {
            prop: {
              type: 'string',
              minLength: 5
            }
          },
          type: 'object'
        })
      })
      it('invalid', () => {
        assert.throws(
          () => StringSchema().minLength('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'minLength' must be an Integer"
        )
      })
    })
    describe('maxLength', () => {
      it('valid', () => {
        const schema = StringSchema().maxLength(10).valueOf()
        assert.deepStrictEqual(schema, {
          type: 'string',
          maxLength: 10
        })
      })
      it('invalid', () => {
        assert.throws(
          () => StringSchema().maxLength('5.1'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'maxLength' must be an Integer"
        )
      })
    })
    describe('format', () => {
      it('valid FORMATS.DATE', () => {
        assert.deepStrictEqual(StringSchema().format(FORMATS.DATE).valueOf(), {
          type: 'string',
          format: FORMATS.DATE
        })
      })
      it('valid FORMATS.DATE_TIME', () => {
        assert.deepStrictEqual(
          StringSchema().format(FORMATS.DATE_TIME).valueOf(),
          {
            type: 'string',
            format: 'date-time'
          }
        )
      })
      it('invalid', () => {
        assert.throws(
          () => StringSchema().format('invalid'),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message ===
              "'format' must be one of relative-json-pointer, json-pointer, uuid, regex, ipv6, ipv4, hostname, email, url, uri-template, uri-reference, uri, time, date, date-time"
        )
      })
    })
    describe('pattern', () => {
      it('as a string', () => {
        assert.deepStrictEqual(StringSchema().pattern('\\/.*\\/').valueOf(), {
          type: 'string',
          pattern: '\\/.*\\/'
        })
      })
      it('as a regex without flags', () => {
        assert.deepStrictEqual(
          StringSchema()
            .pattern(/\/.*\//)
            .valueOf(),
          {
            type: 'string',
            pattern: '\\/.*\\/'
          }
        )
      })

      it('as a regex with flags', () => {
        assert.deepStrictEqual(
          StringSchema()
            .pattern(/\/.*\//gi)
            .valueOf(),
          {
            type: 'string',
            pattern: '\\/.*\\/'
          }
        )
      })

      it('invalid value', () => {
        assert.throws(
          () => StringSchema().pattern(1111),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'pattern' must be a string or a RegEx (e.g. /.*/)"
        )
      })
    })
    describe('contentEncoding', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          StringSchema().contentEncoding('base64').valueOf(),
          {
            type: 'string',
            contentEncoding: 'base64'
          }
        )
      })
      it('invalid', () => {
        assert.throws(
          () => StringSchema().contentEncoding(1000),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'contentEncoding' must be a string"
        )
      })
    })
    describe('contentMediaType', () => {
      it('valid', () => {
        assert.deepStrictEqual(
          StringSchema().contentMediaType('image/png').valueOf(),
          {
            type: 'string',
            contentMediaType: 'image/png'
          }
        )
      })
      it('invalid', () => {
        assert.throws(
          () => StringSchema().contentMediaType(1000),
          (err) =>
            err instanceof S.FluentSchemaError &&
            err.message === "'contentMediaType' must be a string"
        )
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = StringSchema().raw({ customKeyword: true }).valueOf()

        assert.deepStrictEqual(schema, {
          type: 'string',
          customKeyword: true
        })
      })
      it('allows to mix custom attibutes with regular one', () => {
        const schema = StringSchema()
          .format('date')
          .raw({ formatMaximum: '2020-01-01' })
          .valueOf()

        assert.deepStrictEqual(schema, {
          type: 'string',
          formatMaximum: '2020-01-01',
          format: 'date'
        })
      })
    })
  })

  it('works', () => {
    const schema = S.object()
      .id('http://bar.com/object')
      .title('A object')
      .description('A object desc')
      .prop(
        'name',
        StringSchema()
          .id('http://foo.com/string')
          .title('A string')
          .description('A string desc')
          .pattern(/.*/g)
          .format('date-time')
      )
      .valueOf()

    assert.deepStrictEqual(schema, {
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
          pattern: '.*'
        }
      },
      title: 'A object',
      type: 'object'
    })
  })
})
