'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute, FLUENT_SCHEMA } = require('./utils')

const initialState = {
  type: 'null',
}

/**
 * Represents a NullSchema.
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
    [FLUENT_SCHEMA]: true,

    /**
     * Set a property to type null
     *
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
     * @returns {FluentSchema}
     */
    null: () => setAttribute({ schema, ...options }, ['type', 'null']),
  }
}

module.exports = {
  NullSchema,
  default: NullSchema,
}
