'use strict'
const { FORMATS } = require('./utils')

const { BaseSchema } = require('./BaseSchema')
const { StringSchema } = require('./StringSchema')
const { ObjectSchema } = require('./ObjectSchema')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

/**
 * Represents a FluentSchema.
 * @param {Object} [options] - Options
 * @param {FluentSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {FluentSchema}
 */

const FluentSchema = (
  { schema, ...options } = {
    generateIds: false,
    schema: initialState,
    factory: ObjectSchema,
  }
) => ({
  // TODO return an ObjectSchema as default
  ...BaseSchema({ ...options, schema }),

  asString: () => {
    return StringSchema({
      ...options,
      schema,
      factory: StringSchema,
    }).as('string')
  },

  asNumber: () => FluentSchema({ schema: { ...schema }, options }).as('number'),

  /**
   * Set a property to type boolean
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asBoolean: () =>
    FluentSchema({ schema: { ...schema }, options }).as('boolean'),

  /**
   * Set a property to type integer
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asInteger: () =>
    FluentSchema({ schema: { ...schema }, options }).as('integer'),

  /**
   * Set a property to type array
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asArray: () => FluentSchema({ schema: { ...schema }, options }).as('array'),

  asObject: () =>
    ObjectSchema({
      ...options,
      schema,
      factory: ObjectSchema,
    }).as('object'),

  asNull: () =>
    BaseSchema({
      ...options,
      schema,
      factory: BaseSchema,
    }).as('null'),
})

module.exports = {
  FluentSchema,
  FORMATS,
  default: FluentSchema,
}
