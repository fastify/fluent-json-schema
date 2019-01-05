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

  /**
   * Set a property to type string
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {StringSchema}
   */

  string: () =>
    StringSchema({
      ...options,
      schema,
      factory: StringSchema,
    }).as('string'),

  /**
   * Set a property to type number
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#numeric}
   * @returns {NumberSchema}
   */

  number: () =>
    NumberSchema({
      ...options,
      schema,
      factory: NumberSchema,
    }).as('number'),

  /**
   * Set a property to type integer
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#numeric}
   * @returns {IntegerSchema}
   */

  integer: () =>
    IntegerSchema({
      ...options,
      schema,
      factory: IntegerSchema,
    }).as('integer'),

  // TODO LS what should we return? ObjectSchema?
  /*type: (types) => {
    return setAttribute({ schema, ...options }, ['type', types, 'any'])
  },*/

  /**
   * Set a property to type boolean
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#general}
   * @returns {BooleanSchema}
   */

  boolean: () =>
    BooleanSchema({
      ...options,
      schema,
      factory: BooleanSchema,
    }).as('boolean'),

  /**
   * Set a property to type array
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4}
   * @returns {ArraySchema}
   */

  array: () =>
    ArraySchema({
      ...options,
      schema,
      factory: ArraySchema,
    }).as('array'),

  /**
   * Set a property to type object
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5}
   * @returns {ObjectSchema}
   */

  object: () =>
    ObjectSchema({
      ...options,
      schema,
      factory: ObjectSchema,
    }).as('object'),

  /**
   * Set a property to type null
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#general}
   * @returns {NullSchema}
   */

  null: () =>
    NullSchema({
      ...options,
      schema,
      factory: NullSchema,
    }).null(),
})

module.exports = {
  FluentSchema,
  FORMATS,
  default: FluentSchema,
}
