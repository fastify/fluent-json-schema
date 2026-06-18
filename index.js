'use strict'

const { FORMATS, TYPES, FluentSchemaError } = require('./lib/utils')

const { BaseSchema } = require('./lib/BaseSchema')
const { NullSchema } = require('./lib/NullSchema')
const { BooleanSchema } = require('./lib/BooleanSchema')
const { StringSchema } = require('./lib/StringSchema')
const { NumberSchema } = require('./lib/NumberSchema')
const { IntegerSchema } = require('./lib/IntegerSchema')
const { ObjectSchema } = require('./lib/ObjectSchema')
const { ArraySchema } = require('./lib/ArraySchema')
const { MixedSchema } = require('./lib/MixedSchema')
const { RawSchema } = require('./lib/RawSchema')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: [],
  properties: [],
  required: []
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
    factory: BaseSchema
  }
) => ({
  ...BaseSchema({ ...options, schema }),

  /**
   * Set a property to type string
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.3|reference}
   * @returns {StringSchema}
   */

  string: () =>
    StringSchema({
      ...options,
      schema,
      factory: StringSchema
    }).as('string'),

  /**
   * Set a property to type number
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#numeric|reference}
   * @returns {NumberSchema}
   */

  number: () =>
    NumberSchema({
      ...options,
      schema,
      factory: NumberSchema
    }).as('number'),

  /**
   * Set a property to type integer
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#numeric|reference}
   * @returns {IntegerSchema}
   */

  integer: () =>
    IntegerSchema({
      ...options,
      schema,
      factory: IntegerSchema
    }).as('integer'),

  /**
   * Set a property to type boolean
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.7|reference}
   * @returns {BooleanSchema}
   */

  boolean: () =>
    BooleanSchema({
      ...options,
      schema,
      factory: BooleanSchema
    }).as('boolean'),

  /**
   * Set a property to type array
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4|reference}
   * @returns {ArraySchema}
   */

  array: () =>
    ArraySchema({
      ...options,
      schema,
      factory: ArraySchema
    }).as('array'),

  /**
   * Set a property to type object
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5|reference}
   * @returns {ObjectSchema}
   */

  object: baseSchema =>
    ObjectSchema({
      ...options,
      schema: baseSchema || schema,
      factory: ObjectSchema
    }).as('object'),

  /**
   * Set a property to type null
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#general|reference}
   * @returns {NullSchema}
   */

  null: () =>
    NullSchema({
      ...options,
      schema,
      factory: NullSchema
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
      throw new FluentSchemaError(
        `Invalid 'types'. It must be an array of types. Valid types are ${Object.values(
          TYPES
        ).join(' | ')}`
      )
    }

    return MixedSchema({
      ...options,
      schema: {
        ...schema,
        type: types
      },
      factory: MixedSchema
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
   * @returns {BaseSchema}
   */

  raw: fragment => {
    return RawSchema(fragment)
  }
})

const fluentSchema = {
  ...BaseSchema(),
  FORMATS,
  TYPES,
  FluentSchemaError,
  withOptions: S,
  string: () => S().string(),
  mixed: types => S().mixed(types),
  object: () => S().object(),
  array: () => S().array(),
  boolean: () => S().boolean(),
  integer: () => S().integer(),
  number: () => S().number(),
  null: () => S().null(),
  raw: fragment => S().raw(fragment)
}
module.exports = fluentSchema
module.exports.default = fluentSchema
module.exports.S = fluentSchema
