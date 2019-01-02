'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute } = require('./utils')

const initialState = {
  type: 'null',
}

/**
 * Represents a ObjectSchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */

const NullSchema = ({ schema = initialState, ...options } = {}) => {
  options = {
    generateIds: false,
    factory: NullSchema,
    ...options,
  }
  const { valueOf } = BaseSchema({ ...options, schema })
  return {
    valueOf,

    /**
     * Set a property to type null
     *
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
     * @returns {FluentSchema}
     */
    asNull: () => setAttribute({ schema, ...options }, ['type', 'null', 'any']),
  }
}

module.exports = {
  NullSchema,
  default: NullSchema,
}
