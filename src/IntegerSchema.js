'use strict'
const { NumberSchema } = require('./NumberSchema')

const initialState = {
  type: 'integer',
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
const IntegerSchema = (
  { schema, ...options } = {
    schema: initialState,
    generateIds: false,
    factory: IntegerSchema,
  }
) => ({
  ...NumberSchema({ ...options, schema }),
})

module.exports = {
  IntegerSchema,
  default: IntegerSchema,
}
