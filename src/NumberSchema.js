'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute } = require('./utils')

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
   * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.4}
   * @returns {FluentSchema}
   */

  minimum: min => {
    if (typeof min !== 'number') throw new Error("'minimum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(min))
      throw new Error("'minimum' must be an Integer")
    return setAttribute({ schema, ...options }, ['minimum', min, 'number'])
  },

  /**
   * It represents an exclusive lower limit for a numeric instance.
   *
   * * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.5}
   * @returns {FluentSchema}
   */

  exclusiveMinimum: min => {
    if (typeof min !== 'number')
      throw new Error("'exclusiveMinimum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(min))
      throw new Error("'exclusiveMinimum' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'exclusiveMinimum',
      min,
      'number',
    ])
  },

  /**
   * It represents  an inclusive upper limit for a numeric instance.
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.2}
   * @returns {FluentSchema}
   */

  maximum: max => {
    if (typeof max !== 'number') throw new Error("'maximum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(max))
      throw new Error("'maximum' must be an Integer")
    return setAttribute({ schema, ...options }, ['maximum', max, 'number'])
  },

  /**
   * It represents an exclusive upper limit for a numeric instance.
   *
   * @param {number} max
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.3}
   * @returns {FluentSchema}
   */

  exclusiveMaximum: max => {
    if (typeof max !== 'number')
      throw new Error("'exclusiveMaximum' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(max))
      throw new Error("'exclusiveMaximum' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'exclusiveMaximum',
      max,
      'number',
    ])
  },

  /**
   * It's strictly greater than 0.
   *
   * @param {number} multiple
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.1}
   * @returns {FluentSchema}
   */

  multipleOf: multiple => {
    if (typeof multiple !== 'number')
      throw new Error("'multipleOf' must be a Number")
    if (schema.type === 'integer' && !Number.isInteger(multiple))
      throw new Error("'multipleOf' must be an Integer")
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
