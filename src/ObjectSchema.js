'use strict'
const { BaseSchema } = require('./BaseSchema')
const {
  omit,
  setAttribute,
  isFluentSchema,
  hasCombiningKeywords,
  patchIdsWithParentId,
  appendRequired,
} = require('./utils')

const initialState = {
  // $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

/**
 * Represents a ObjectSchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */
// https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1
// Factory Functions for Mixin Composition withBaseSchema
const ObjectSchema = ({ schema = initialState, ...options } = {}) => {
  // TODO LS think about default values and how pass all of them through the functions
  options = {
    generateIds: false,
    factory: ObjectSchema,
    ...options,
  }
  return {
    ...BaseSchema({ ...options, schema }),

    /**
     * This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
     * Validation with "additionalProperties" applies only to the child values of instance names that do not match any names in "properties",
     * and do not match any regular expression in "patternProperties".
     * For all such properties, validation succeeds if the child instance validates against the "additionalProperties" schema.
     * Omitting this keyword has the same behavior as an empty schema.
     *
     * @param {FluentSchema|boolean} value
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.6}
     * @returns {FluentSchema}
     */

    additionalProperties: value => {
      if (typeof value !== 'boolean' && !isFluentSchema(value))
        throw new Error(
          "'additionalProperties' must be a boolean or a FluentSchema"
        )
      if (value === false) {
        return setAttribute({ schema, ...options }, [
          'additionalProperties',
          false,
          'object',
        ])
      }
      const { $schema, ...rest } = value.valueOf()
      return setAttribute({ schema, ...options }, [
        'additionalProperties',
        { ...rest },
        'array',
      ])
    },

    /**
     * An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.
     *
     * @param {number} max
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.1}
     * @returns {FluentSchema}
     */

    maxProperties: max => {
      if (!Number.isInteger(max))
        throw new Error("'maxProperties' must be a Integer")
      return setAttribute({ schema, ...options }, [
        'maxProperties',
        max,
        'object',
      ])
    },

    /**
     * An object instance is valid against "minProperties" if its number of properties is greater than, or equal to, the value of this keyword.
     *
     * @param {number} min
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.2}
     * @returns {FluentSchema}
     */

    minProperties: min => {
      if (!Number.isInteger(min))
        throw new Error("'minProperties' must be a Integer")
      return setAttribute({ schema, ...options }, [
        'minProperties',
        min,
        'object',
      ])
    },

    /**
     * Each property name of this object SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
     * Each property value of this object MUST be a valid JSON Schema.
     * This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
     * Validation of the primitive instance type against this keyword always succeeds.
     * Validation succeeds if, for each instance name that matches any regular expressions that appear as a property name in this keyword's value, the child instance for that name successfully validates against each schema that corresponds to a matching regular expression.
     *
     * @param {object} opts
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.5}
     * @returns {FluentSchema}
     */

    patternProperties: opts => {
      const values = Object.entries(opts).reduce((memo, [pattern, schema]) => {
        if (!isFluentSchema(schema))
          throw new Error(
            "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': FluentSchema().asString() }"
          )
        return {
          ...memo,
          [pattern]: omit(schema.valueOf(), ['$schema']),
        }
      }, {})
      return setAttribute({ schema, ...options }, [
        'patternProperties',
        values,
        'object',
      ])
    },

    /**
     * This keyword specifies rules that are evaluated if the instance is an object and contains a certain property.
     * This keyword's value MUST be an object. Each property specifies a dependency. Each dependency value MUST be an array or a valid JSON Schema.
     * If the dependency value is a subschema, and the dependency key is a property in the instance, the entire instance must validate against the dependency value.
     * If the dependency value is an array, each element in the array, if any, MUST be a string, and MUST be unique. If the dependency key is a property in the instance, each of the items in the dependency value must be a property that exists in the instance.
     *
     * @param {object} opts
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7}
     * @returns {FluentSchema}
     */

    dependencies: opts => {
      const values = Object.entries(opts).reduce((memo, [prop, schema]) => {
        if (!isFluentSchema(schema) && !Array.isArray(schema))
          throw new Error(
            "'dependencies' invalid options. Provide a valid map e.g. { 'foo': ['ba'] } or { 'foo': FluentSchema().asString() }"
          )
        return {
          ...memo,
          [prop]: Array.isArray(schema)
            ? schema
            : omit(schema.valueOf(), ['$schema', 'type', 'definitions']),
        }
      }, {})
      return setAttribute({ schema, ...options }, [
        'dependencies',
        values,
        'object',
      ])
    },

    /**
     * If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.
     * Note the property name that the schema is testing will always be a string.
     *
     * @param {FluentSchema} value
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7}
     * @returns {FluentSchema}
     */

    propertyNames: value => {
      if (!isFluentSchema(value))
        throw new Error("'propertyNames' must be a FluentSchema")
      return setAttribute({ schema, ...options }, [
        'propertyNames',
        omit(value.valueOf(), ['$schema']),
        'object',
      ])
    },

    /**
     * The value of "properties" MUST be an object. Each value of this object MUST be a valid JSON Schema
     *
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.4}
     * @param {string} name
     * @param {FluentSchema} props
     * @returns {FluentSchema}
     */

    prop: (name, props = {}) => {
      const target = props.def ? 'definitions' : 'properties'
      let attributes = props.valueOf()
      const $id =
        attributes.$id ||
        (options.generateIds ? `#${target}/${name}` : undefined)
      if (isFluentSchema(props)) {
        attributes = patchIdsWithParentId({
          schema: attributes,
          parentId: $id,
          ...options,
        })

        const [schemaPatched, attributesPatched] = appendRequired({
          schema,
          attributes: {
            ...attributes,
            name,
          },
        })

        schema = schemaPatched
        attributes = attributesPatched
      }

      const type = hasCombiningKeywords(attributes)
        ? undefined
        : //TODO LS think if we set the default type as string
          attributes.type || 'string'

      const {
        $ref,
        title,
        description,
        defaults,
        examples,
        // compound
        anyOf,
        allOf,
        oneOf,
        not,
        // string
        minLength,
        maxLength,
        pattern,
        format,
        contentEncoding,
        contentMediaType,
        // number
        minimum,
        maximum,
        multipleOf,
        exclusiveMaximum,
        exclusiveMinimum,
        // array
        items,
        contains,
        uniqueItems,
        minItems,
        maxItems,
        additionalItems,
        // object
        maxProperties,
        minProperties,
        required,
        properties,
        patternProperties,
        additionalProperties,
        dependencies,
        propertyNames,
      } = attributes

      return ObjectSchema({
        schema: {
          ...schema,
          [target]: [
            ...schema[target],
            $ref
              ? { name, $ref }
              : Object.assign(
                  {},
                  { name },
                  // TODO LS that's quite verbose :)
                  type !== undefined ? { type } : undefined,
                  defaults !== undefined ? { default: defaults } : undefined,
                  title !== undefined ? { title } : undefined,
                  examples !== undefined ? { examples } : undefined,
                  $id !== undefined ? { $id } : undefined,
                  description !== undefined ? { description } : undefined,
                  attributes.const !== undefined
                    ? { const: attributes.const }
                    : undefined,
                  attributes.enum !== undefined
                    ? { enum: attributes.enum }
                    : undefined,
                  // compounds
                  anyOf !== undefined ? { anyOf } : undefined,
                  oneOf !== undefined ? { oneOf } : undefined,
                  allOf !== undefined ? { allOf } : undefined,
                  not !== undefined ? { not } : undefined,
                  // string
                  minLength !== undefined ? { minLength } : undefined,
                  maxLength !== undefined ? { maxLength } : undefined,
                  pattern !== undefined ? { pattern } : undefined,
                  format !== undefined ? { format } : undefined,
                  contentEncoding !== undefined
                    ? { contentEncoding }
                    : undefined,
                  contentMediaType !== undefined
                    ? { contentMediaType }
                    : undefined,
                  // number
                  minimum !== undefined ? { minimum } : undefined,
                  maximum !== undefined ? { maximum } : undefined,
                  multipleOf !== undefined ? { multipleOf } : undefined,
                  exclusiveMaximum !== undefined
                    ? { exclusiveMaximum }
                    : undefined,
                  exclusiveMinimum !== undefined
                    ? { exclusiveMinimum }
                    : undefined,
                  // array
                  items !== undefined ? { items } : undefined,
                  contains !== undefined ? { contains } : undefined,
                  uniqueItems !== undefined ? { uniqueItems } : undefined,
                  minItems !== undefined ? { minItems } : undefined,
                  maxItems !== undefined ? { maxItems } : undefined,
                  additionalItems !== undefined
                    ? { additionalItems }
                    : undefined,
                  // object
                  maxProperties !== undefined ? { maxProperties } : undefined,
                  minProperties !== undefined ? { minProperties } : undefined,
                  required && required.length > 0 ? { required } : undefined,
                  properties !== undefined ? { properties } : undefined,
                  patternProperties !== undefined
                    ? { patternProperties }
                    : undefined,
                  additionalProperties !== undefined
                    ? { additionalProperties }
                    : undefined,
                  dependencies !== undefined ? { dependencies } : undefined,
                  propertyNames !== undefined ? { propertyNames } : undefined
                ),
          ],
        },
        ...options,
      })
    },

    /**
     * The value must be a valid id e.g. #properties/foo
     *
     * @param {string} ref
     * @returns {FluentSchema}
     */

    ref: ref => {
      return setAttribute({ schema, ...options }, ['$ref', ref, 'any'])
    },

    /**
     * The "definitions" keywords provides a standardized location for schema authors to inline re-usable JSON Schemas into a more general schema.
     * There are no restrictions placed on the values within the array.
     *
     * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.9}
     * @param {string} name
     * @param {FluentSchema} props
     * @returns {FluentSchema}
     */

    definition: (name, props = {}) =>
      ObjectSchema({ schema, ...options }).prop(name, {
        ...props.valueOf(),
        def: true,
      }),
  }
}

module.exports = {
  ObjectSchema,
  default: ObjectSchema,
}
