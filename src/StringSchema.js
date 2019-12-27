'use strict'
const { BaseSchema } = require('./BaseSchema')
const { last, FORMATS, setAttribute } = require('./utils')

const initialState = {
  type: 'string',
  // properties: [], //FIXME it shouldn't be set for a string because it has only attributes
  required: [],
}

/**
 * Represents a StringSchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */
// https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
// Factory Functions for Mixin Composition withBaseSchema
const StringSchema = (
  { schema, ...options } = {
    schema: initialState,
    generateIds: false,
    factory: StringSchema,
  }
) => ({
  ...BaseSchema({ ...options, schema }),
  /*/!**
   * Set a property to type string
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {StringSchema}
   *!/

  string: () =>
    StringSchema({ schema: { ...schema }, ...options }).as('string'),*/

  /**
   * A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
   * The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   *
   * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2}
   * @returns {StringSchema}
   */

  minLength: min => {
    if (!Number.isInteger(min))
      throw new Error("'minLength' must be an Integer")
    return setAttribute({ schema, ...options }, ['minLength', min, 'string'])
  },

  /**
   * A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
   * The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   *
   * @param {number} max
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2}
   * @returns {StringSchema}
   */

  maxLength: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxLength' must be an Integer")
    return setAttribute({ schema, ...options }, ['maxLength', max, 'string'])
  },

  /**
   * A string value can be RELATIVE_JSON_POINTER, JSON_POINTER, UUID, REGEX, IPV6, IPV4, HOSTNAME, EMAIL, URL, URI_TEMPLATE, URI_REFERENCE, URI, TIME, DATE,
   *
   * @param {string} format
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.7.3}
   * @returns {StringSchema}
   */

  format: format => {
    if (!Object.values(FORMATS).includes(format))
      throw new Error(
        `'format' must be one of ${Object.values(FORMATS).join(', ')}`
      )
    return setAttribute({ schema, ...options }, ['format', format, 'string'])
  },

  /**
   *  This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
   *  A string instance is considered valid if the regular expression matches the instance successfully.
   *
   * @param {string} pattern
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3}
   * @returns {StringSchema}
   */
  pattern: pattern => {
    if (!(typeof pattern === 'string') && !(pattern instanceof RegExp))
      throw new Error(`'pattern' must be a string or a RegEx (e.g. /.*/)`)

    if (pattern instanceof RegExp) {
      const flags = new RegExp(pattern).flags
      pattern = pattern
        .toString()
        .substr(1)
        .replace(`/${flags}`, '')
    }

    return setAttribute({ schema, ...options }, ['pattern', pattern, 'string'])
  },

  /**
   *  If the instance value is a string, this property defines that the string SHOULD
   *  be interpreted as binary data and decoded using the encoding named by this property.
   *  RFC 2045, Sec 6.1 [RFC2045] lists the possible values for this property.
   *
   * @param {string} encoding
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3}
   * @returns {StringSchema}
   */

  contentEncoding: encoding => {
    if (!(typeof encoding === 'string'))
      throw new Error(`'contentEncoding' must be a string`)
    return setAttribute({ schema, ...options }, [
      'contentEncoding',
      encoding,
      'string',
    ])
  },

  /**
   *  The value of this property must be a media type, as defined by RFC 2046 [RFC2046].
   *  This property defines the media type of instances which this schema defines.
   *
   * @param {string} mediaType
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3}
   * @returns {StringSchema}
   */

  contentMediaType: mediaType => {
    if (!(typeof mediaType === 'string'))
      throw new Error(`'contentMediaType' must be a string`)
    return setAttribute({ schema, ...options }, [
      'contentMediaType',
      mediaType,
      'string',
    ])
  },
})

module.exports = {
  StringSchema,
  FORMATS,
  default: StringSchema,
}
