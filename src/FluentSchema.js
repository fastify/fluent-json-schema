'use strict'

const { FORMATS, TYPES } = require('./utils')

const { BaseSchema } = require('./BaseSchema')
const { NullSchema } = require('./NullSchema')
const { BooleanSchema } = require('./BooleanSchema')
const { StringSchema } = require('./StringSchema')
const { NumberSchema } = require('./NumberSchema')
const { IntegerSchema } = require('./IntegerSchema')
const { ObjectSchema } = require('./ObjectSchema')
const { ArraySchema } = require('./ArraySchema')
const { MixedSchema } = require('./MixedSchema')
const { RawSchema } = require('./RawSchema')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: [],
  properties: [],
  required: [],
}

/**
 * Represents a S.
 * @param {Object} [options] - Options
 * @param {S} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {S}
 */

const S = (
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

  object: baseSchema =>
    ObjectSchema({
      ...options,
      schema: baseSchema || schema,
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

  /**
   * A mixed schema is the union of multiple types (e.g. ['string', 'integer']
   *
   * @param {Array.<string>} types
   * @returns {MixedSchema}
   */

  mixed: types => {
    if (
      !Array.isArray(types) ||
      (Array.isArray(types) &&
        types.filter(t => !Object.values(TYPES).includes(t)).length > 0)
    ) {
      throw new Error(
        `Invalid 'types'. It must be an array of types. Valid types are ${Object.values(
          TYPES
        ).join(' | ')}`
      )
    }

    return MixedSchema({
      ...options,
      schema: {
        ...schema,
        type: types,
      },
      factory: MixedSchema,
    })
  },

  /**
   * Because the differences between JSON Schemas and Open API (Swagger)
   * it can be handy to arbitrary modify the schema injecting a fragment
   *
   * * Examples:
   * - S.raw({ nullable:true, format: 'date', formatMaximum: '2020-01-01' })
   * - S.string().format('date').raw({ formatMaximum: '2020-01-01' })
   *
   * @param {string} fragment an arbitrary JSON Schema to inject
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3}
   * @returns {BaseSchema}
   */

  raw: fragment => {
    return RawSchema(fragment)
  },
})

module.exports = {
  ...BaseSchema(),
  FORMATS,
  TYPES,
  withOptions: S,
  string: () => S().string(),
  mixed: types => S().mixed(types),
  object: () => S().object(),
  array: () => S().array(),
  boolean: () => S().boolean(),
  integer: () => S().integer(),
  number: () => S().number(),
  null: () => S().null(),
  raw: fragment => S().raw(fragment),
}
