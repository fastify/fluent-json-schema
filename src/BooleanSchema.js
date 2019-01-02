'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute } = require('./utils')

const initialState = {
  type: 'boolean',
}

/**
 * Represents a BooleanSchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */

const BooleanSchema = ({ schema = initialState, ...options } = {}) => {
  options = {
    generateIds: false,
    factory: BaseSchema,
    ...options,
  }
  return {
    ...BaseSchema({ ...options, schema }),
  }
}

module.exports = {
  BooleanSchema,
  default: BooleanSchema,
}
