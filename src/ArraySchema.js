'use strict'
const { BaseSchema } = require('./BaseSchema')
const { setAttribute, isFluentSchema, FluentSchemaError } = require('./utils')

const initialState = {
  // $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  definitions: [],
  properties: [],
  required: [],
}

/**
 * Represents a ArraySchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {ArraySchema}
 */
// https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
// Factory Functions for Mixin Composition withBaseSchema
const ArraySchema = ({ schema = initialState, ...options } = {}) => {
  options = {
    generateIds: false,
    factory: ArraySchema,
    ...options,
  }
  return {
    ...BaseSchema({ ...options, schema }),

    /**
     * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
     * If "items" is a schema, validation succeeds if all elements in the array successfully validate against that schema.
     * If "items" is an array of schemas, validation succeeds if each element of the instance validates against the schema at the same position, if any.
     * Omitting this keyword has the same behavior as an empty schema.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.1|reference}
     * @param {FluentSchema|FluentSchema[]} items
     * @returns {FluentSchema}
     */

    items: items => {
      if (
        !isFluentSchema(items) &&
        !(
          Array.isArray(items) &&
          items.filter(v => isFluentSchema(v)).length > 0
        )
      )
        throw new FluentSchemaError("'items' must be a S or an array of S")
      if (Array.isArray(items)) {
        const values = items.map(v => {
          const { $schema, ...rest } = v.valueOf()
          return rest
        })
        return setAttribute({ schema, ...options }, ['items', values, 'array'])
      }
      const { $schema, ...rest } = items.valueOf()
      return setAttribute({ schema, ...options }, [
        'items',
        { ...rest },
        'array',
      ])
    },

    /**
     * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.2|reference}
     * @param {FluentSchema|boolean} items
     * @returns {FluentSchema}
     */

    additionalItems: items => {
      if (typeof items !== 'boolean' && !isFluentSchema(items))
        throw new FluentSchemaError(
          "'additionalItems' must be a boolean or a S"
        )
      if (items === false) {
        return setAttribute({ schema, ...options }, [
          'additionalItems',
          false,
          'array',
        ])
      }
      const { $schema, ...rest } = items.valueOf()
      return setAttribute({ schema, ...options }, [
        'additionalItems',
        { ...rest },
        'array',
      ])
    },

    /**
     * An array instance is valid against "contains" if at least one of its elements is valid against the given schema.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.6|reference}
     * @param {FluentSchema} value
     * @returns {FluentSchema}
     */

    contains: value => {
      if (!isFluentSchema(value))
        throw new FluentSchemaError("'contains' must be a S")
      const {
        $schema,
        definitions,
        properties,
        required,
        ...rest
      } = value.valueOf()
      return setAttribute({ schema, ...options }, [
        'contains',
        { ...rest },
        'array',
      ])
    },

    /**
     * If this keyword has boolean value false, the instance validates successfully.
     * If it has boolean value true, the instance validates successfully if all of its elements are unique.
     * Omitting this keyword has the same behavior as a value of false.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.5|reference}
     * @param {boolean} boolean
     * @returns {FluentSchema}
     */

    uniqueItems: boolean => {
      if (typeof boolean !== 'boolean')
        throw new FluentSchemaError("'uniqueItems' must be a boolean")
      return setAttribute({ schema, ...options }, [
        'uniqueItems',
        boolean,
        'array',
      ])
    },

    /**
     * An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
     * Omitting this keyword has the same behavior as a value of 0.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.4|reference}
     * @param {number} min
     * @returns {FluentSchema}
     */

    minItems: min => {
      if (!Number.isInteger(min))
        throw new FluentSchemaError("'minItems' must be a integer")
      return setAttribute({ schema, ...options }, ['minItems', min, 'array'])
    },

    /**
     * An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
     * Omitting this keyword has the same behavior as a value of 0.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.4.3|reference}
     * @param {number} max
     * @returns {FluentSchema}
     */

    maxItems: max => {
      if (!Number.isInteger(max))
        throw new FluentSchemaError("'maxItems' must be a integer")
      return setAttribute({ schema, ...options }, ['maxItems', max, 'array'])
    },
  }
}

module.exports = {
  ArraySchema,
  default: ArraySchema,
}
