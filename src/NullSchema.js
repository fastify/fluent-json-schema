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
  const { valueOf, raw } = BaseSchema({ ...options, schema })
  return {
    valueOf,
    raw,
    [FLUENT_SCHEMA]: true,
    isFluentSchema: true,

    /**
     * Set a property to type null
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.1.1|reference}
     * @returns {FluentSchema}
     */
    null: () => setAttribute({ schema, ...options }, ['type', 'null']),
  }
}

module.exports = {
  NullSchema,
  default: NullSchema,
}
