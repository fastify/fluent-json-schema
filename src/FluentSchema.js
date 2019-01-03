'use strict'
const { FORMATS } = require('./utils')

const { BaseSchema } = require('./BaseSchema')
const { NullSchema } = require('./NullSchema')
const { BooleanSchema } = require('./BooleanSchema')
const { StringSchema } = require('./StringSchema')
const { NumberSchema } = require('./NumberSchema')
const { IntegerSchema } = require('./IntegerSchema')
const { ObjectSchema } = require('./ObjectSchema')
const { ArraySchema } = require('./ArraySchema')

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
  { schema = initialState, ...options } = {
    generateIds: false,
    factory: BaseSchema,
  }
) => ({
  ...BaseSchema({ ...options, schema }),

  asString: () =>
    StringSchema({
      ...options,
      schema,
      factory: StringSchema,
    }).as('string'),

  asNumber: () =>
    NumberSchema({
      ...options,
      schema,
      factory: NumberSchema,
    }).as('number'),

  /**
   * Set a property to type integer
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asInteger: () =>
    IntegerSchema({
      ...options,
      schema,
      factory: IntegerSchema,
    }).as('integer'),

  /*type: (types) => {
    // TODO LS what should we return? ObjectSchema?
    return setAttribute({ schema, ...options }, ['type', types, 'any'])
  },*/

  /**
   * Set a property to type boolean
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asBoolean: () =>
    BooleanSchema({
      ...options,
      schema,
      factory: BooleanSchema,
    }).as('boolean'),

  /**
   * Set a property to type array
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asArray: () =>
    ArraySchema({
      ...options,
      schema,
      factory: ArraySchema,
    }).as('array'),

  asObject: () =>
    ObjectSchema({
      ...options,
      schema,
      factory: ObjectSchema,
    }).as('object'),

  asNull: () =>
    NullSchema({
      ...options,
      schema,
      factory: NullSchema,
    }).asNull(),
})

module.exports = {
  FluentSchema,
  FORMATS,
  default: FluentSchema,
}
