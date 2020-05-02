'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute, FluentSchemaError } = require('./utils')

const initialState = {
  type: 'number',
}

/**
 * Represents a NumberSchema.
 * @param {Object} [options] - Options
 * @param {NumberSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {NumberSchema}
 */
// https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
// Factory Functions for Mixin Composition withBaseSchema
const NumberSchema = (
  { schema, ...options } = {
    schema: initialState,
    generateIds: false,
    factory: NumberSchema,
  }
) => ({
  ...BaseSchema({ ...options, schema }),

  /**
   * It represents  an inclusive lower limit for a numeric instance.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.2.4|reference}
   * @param {number} min
   * @returns {FluentSchema}
   */

  minimum: min => {
    if (typeof min !== 'number')
      throw new FluentSchemaError("'minimum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(min))
      throw new FluentSchemaError("'minimum' must be an Integer")
    return setAttribute({ schema, ...options }, ['minimum', min, 'number'])
  },

  /**
   * It represents an exclusive lower limit for a numeric instance.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.2.5|reference}
   * @param {number} min
   * @returns {FluentSchema}
   */

  exclusiveMinimum: min => {
    if (typeof min !== 'number')
      throw new FluentSchemaError("'exclusiveMinimum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(min))
      throw new FluentSchemaError("'exclusiveMinimum' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'exclusiveMinimum',
      min,
      'number',
    ])
  },

  /**
   * It represents  an inclusive upper limit for a numeric instance.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.2.2|reference}
   * @param {number} max
   * @returns {FluentSchema}
   */

  maximum: max => {
    if (typeof max !== 'number')
      throw new FluentSchemaError("'maximum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(max))
      throw new FluentSchemaError("'maximum' must be an Integer")
    return setAttribute({ schema, ...options }, ['maximum', max, 'number'])
  },

  /**
   * It represents an exclusive upper limit for a numeric instance.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.2.3|reference}
   * @param {number} max
   * @returns {FluentSchema}
   */

  exclusiveMaximum: max => {
    if (typeof max !== 'number')
      throw new FluentSchemaError("'exclusiveMaximum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(max))
      throw new FluentSchemaError("'exclusiveMaximum' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'exclusiveMaximum',
      max,
      'number',
    ])
  },

  /**
   * It's strictly greater than 0.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.2.1|reference}
   * @param {number} multiple
   * @returns {FluentSchema}
   */

  multipleOf: multiple => {
    if (typeof multiple !== 'number')
      throw new FluentSchemaError("'multipleOf' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(multiple))
      throw new FluentSchemaError("'multipleOf' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'multipleOf',
      multiple,
      'number',
    ])
  },
})

module.exports = {
  NumberSchema,
  default: NumberSchema,
}
