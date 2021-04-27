const { StringSchema, FORMATS } = require('./StringSchema')
const S = require('./FluentJSONSchema')

describe('StringSchema', () => {
  it('defined', () => {
    expect(StringSchema).toBeDefined()
  })

  it('Expose symbol', () => {
    expect(StringSchema()[Symbol.for('fluent-schema-object')]).toBeDefined()
  })

  describe('constructor', () => {
    it('without params', () => {
      expect(StringSchema().valueOf()).toEqual({
        type: 'string',
      })
    })

    it('from S', () => {
      expect(S.string().valueOf()).toEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
      })
    })
  })

  describe('keywords:', () => {
    describe('minLength', () => {
      it('valid', () => {
        const schema = S.object()
          .prop('prop', StringSchema().minLength(5))
          .valueOf()
        expect(schema).toEqual({
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
        expect(() => StringSchema().minLength('5.1')).toThrowError(
          new S.FluentSchemaError("'minLength' must be an Integer")
        )
      })
    })
    describe('maxLength', () => {
      it('valid', () => {
        const schema = StringSchema()
          .maxLength(10)
          .valueOf()
        expect(schema).toEqual({
          type: 'string',
          maxLength: 10,
        })
      })
      it('invalid', () => {
        expect(() => StringSchema().maxLength('5.1')).toThrowError(
          new S.FluentSchemaError("'maxLength' must be an Integer")
        )
      })
    })
    describe('format', () => {
      it('valid FORMATS.DATE', () => {
        expect(
          StringSchema()
            .format(FORMATS.DATE)
            .valueOf()
        ).toEqual({
          type: 'string',
          format: FORMATS.DATE,
        })
      })
      it('valid FORMATS.DATE_TIME', () => {
        expect(
          StringSchema()
            .format(FORMATS.DATE_TIME)
            .valueOf()
        ).toEqual({
          type: 'string',
          format: 'date-time',
        })
      })
      it('invalid', () => {
        expect(() => StringSchema().format('invalid')).toThrowError(
          new S.FluentSchemaError(
            "'format' must be one of relative-json-pointer, json-pointer, uuid, regex, ipv6, ipv4, hostname, email, url, uri-template, uri-reference, uri, time, date, date-time"
          )
        )
      })
    })
    describe('pattern', () => {
      it('as a string', () => {
        expect(
          StringSchema()
            .pattern('\\/.*\\/')
            .valueOf()
        ).toEqual({
          type: 'string',
          pattern: '\\/.*\\/',
        })
      })
      it('as a regex without flags', () => {
        const prop = 'prop'
        expect(
          StringSchema()
            .pattern(/\/.*\//)
            .valueOf()
        ).toEqual({
          type: 'string',
          pattern: '\\/.*\\/',
        })
      })

      it('as a regex with flags', () => {
        const prop = 'prop'
        expect(
          StringSchema()
            .pattern(/\/.*\//gi)
            .valueOf()
        ).toEqual({
          type: 'string',
          pattern: '\\/.*\\/',
        })
      })

      it('invalid value', () => {
        expect(() => StringSchema().pattern(1111)).toThrowError(
          new S.FluentSchemaError(
            "'pattern' must be a string or a RegEx (e.g. /.*/)"
          )
        )
      })
    })
    describe('contentEncoding', () => {
      it('valid', () => {
        expect(
          StringSchema()
            .contentEncoding('base64')
            .valueOf()
        ).toEqual({
          type: 'string',
          contentEncoding: 'base64',
        })
      })
      it('invalid', () => {
        expect(() => StringSchema().contentEncoding(1000)).toThrowError(
          new S.FluentSchemaError("'contentEncoding' must be a string")
        )
      })
    })
    describe('contentMediaType', () => {
      it('valid', () => {
        expect(
          StringSchema()
            .contentMediaType('image/png')
            .valueOf()
        ).toEqual({
          type: 'string',
          contentMediaType: 'image/png',
        })
      })
      it('invalid', () => {
        const prop = 'prop'
        expect(() => StringSchema().contentMediaType(1000)).toThrowError(
          new S.FluentSchemaError("'contentMediaType' must be a string")
        )
      })
    })

    describe('raw', () => {
      it('allows to add a custom attribute', () => {
        const schema = StringSchema()
          .raw({ customKeyword: true })
          .valueOf()

        expect(schema).toEqual({
          type: 'string',
          customKeyword: true,
        })
      })
      it('allows to mix custom attibutes with regular one', () => {
        const schema = StringSchema()
          .format('date')
          .raw({ formatMaximum: '2020-01-01' })
          .valueOf()

        expect(schema).toEqual({
          type: 'string',
          formatMaximum: '2020-01-01',
          format: 'date',
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
