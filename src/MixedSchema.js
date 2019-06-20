'use strict'
const { BaseSchema } = require('./BaseSchema')
const { NullSchema } = require('./NullSchema')
const { BooleanSchema } = require('./BooleanSchema')
const { StringSchema } = require('./StringSchema')
const { NumberSchema } = require('./NumberSchema')
const { IntegerSchema } = require('./IntegerSchema')
const { ObjectSchema } = require('./ObjectSchema')
const { ArraySchema } = require('./ArraySchema')

const { TYPES, setAttribute, FLUENT_SCHEMA } = require('./utils')

const initialState = {
  type: [],
  definitions: [],
  properties: [],
  required: [],
}

/**
 * Represents a MixedSchema.
 * @param {Object} [options] - Options
 * @param {MixedSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */

const MixedSchema = ({ schema = initialState, ...options } = {}) => {
  options = {
    generateIds: false,
    factory: MixedSchema,
    ...options,
  }
  return {
    [FLUENT_SCHEMA]: true,
    ...(schema.type.includes(TYPES.STRING)
      ? StringSchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.NUMBER)
      ? NumberSchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.BOOLEAN)
      ? BooleanSchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.INTEGER)
      ? IntegerSchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.OBJECT)
      ? ObjectSchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.ARRAY)
      ? ArraySchema({ ...options, schema, factory: MixedSchema })
      : {}),
    ...(schema.type.includes(TYPES.NULL)
      ? NullSchema({ ...options, schema, factory: MixedSchema })
      : {}),
  }
}

module.exports = {
  MixedSchema,
  default: MixedSchema,
}
