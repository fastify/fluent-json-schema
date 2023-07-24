'use strict'
const { BaseSchema } = require('./BaseSchema')
const {
  omit,
  setAttribute,
  isFluentSchema,
  hasCombiningKeywords,
  patchIdsWithParentId,
  appendRequired,
  FluentSchemaError,
  combineDeepmerge
} = require('./utils')

const initialState = {
  type: 'object',
  definitions: [],
  properties: [],
  required: []
}

/**
 * Represents a ObjectSchema.
 * @param {Object} [options] - Options
 * @param {StringSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {StringSchema}
 */

const ObjectSchema = ({ schema = initialState, ...options } = {}) => {
  // TODO LS think about default values and how pass all of them through the functions
  options = {
    generateIds: false,
    factory: ObjectSchema,
    ...options
  }
  return {
    ...BaseSchema({ ...options, schema }),

    /**
     * It defines a URI for the schema, and the base URI that other URI references within the schema are resolved against.
     * Calling `id`  on an ObjectSchema will alway set the id on the root of the object rather than in its "properties", which
     * differs from other schema types.
     *
     * {@link https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.2|reference}
     * @param {string} id - an #id
     **/
    id: id => {
      if (!id) {
        throw new FluentSchemaError(
          'id should not be an empty fragment <#> or an empty string <> (e.g. #myId)'
        )
      }
      return options.factory({ schema: { ...schema, $id: id }, ...options })
    },
    /**
     * This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
     * Validation with "additionalProperties" applies only to the child values of instance names that do not match any names in "properties",
     * and do not match any regular expression in "patternProperties".
     * For all such properties, validation succeeds if the child instance validates against the "additionalProperties" schema.
     * Omitting this keyword has the same behavior as an empty schema.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.6|reference}
     * @param {FluentSchema|boolean} value
     * @returns {FluentSchema}
     */

    additionalProperties: value => {
      if (typeof value === 'boolean') {
        return setAttribute({ schema, ...options }, [
          'additionalProperties',
          value,
          'object'
        ])
      }
      if (isFluentSchema(value)) {
        const { $schema, ...rest } = value.valueOf({ isRoot: false })
        return setAttribute({ schema, ...options }, [
          'additionalProperties',
          { ...rest },
          'array'
        ])
      }

      throw new FluentSchemaError(
        "'additionalProperties' must be a boolean or a S"
      )
    },

    /**
     * An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.1|reference}
     * @param {number} max
     * @returns {FluentSchema}
     */

    maxProperties: max => {
      if (!Number.isInteger(max)) { throw new FluentSchemaError("'maxProperties' must be a Integer") }
      return setAttribute({ schema, ...options }, [
        'maxProperties',
        max,
        'object'
      ])
    },

    /**
     * An object instance is valid against "minProperties" if its number of properties is greater than, or equal to, the value of this keyword.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.2|reference}
     * @param {number} min
     * @returns {FluentSchema}
     */

    minProperties: min => {
      if (!Number.isInteger(min)) { throw new FluentSchemaError("'minProperties' must be a Integer") }
      return setAttribute({ schema, ...options }, [
        'minProperties',
        min,
        'object'
      ])
    },

    /**
     * Each property name of this object SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
     * Each property value of this object MUST be a valid JSON Schema.
     * This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
     * Validation of the primitive instance type against this keyword always succeeds.
     * Validation succeeds if, for each instance name that matches any regular expressions that appear as a property name in this keyword's value, the child instance for that name successfully validates against each schema that corresponds to a matching regular expression.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.5|reference}
     * @param {object} opts
     * @returns {FluentSchema}
     */

    patternProperties: opts => {
      const values = Object.entries(opts).reduce((memo, [pattern, schema]) => {
        if (!isFluentSchema(schema)) {
          throw new FluentSchemaError(
            "'patternProperties' invalid options. Provide a valid map e.g. { '^fo.*$': S.string() }"
          )
        }
        return {
          ...memo,
          [pattern]: omit(schema.valueOf({ isRoot: false }), ['$schema'])
        }
      }, {})
      return setAttribute({ schema, ...options }, [
        'patternProperties',
        values,
        'object'
      ])
    },

    /**
     * This keyword specifies rules that are evaluated if the instance is an object and contains a certain property.
     * This keyword's value MUST be an object. Each property specifies a dependency. Each dependency value MUST be an array or a valid JSON Schema.
     * If the dependency value is a subschema, and the dependency key is a property in the instance, the entire instance must validate against the dependency value.
     * If the dependency value is an array, each element in the array, if any, MUST be a string, and MUST be unique. If the dependency key is a property in the instance, each of the items in the dependency value must be a property that exists in the instance.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.7|reference}
     * @param {object} opts
     * @returns {FluentSchema}
     */

    dependencies: opts => {
      const values = Object.entries(opts).reduce((memo, [prop, schema]) => {
        if (!isFluentSchema(schema) && !Array.isArray(schema)) {
          throw new FluentSchemaError(
            "'dependencies' invalid options. Provide a valid map e.g. { 'foo': ['bar'] } or { 'foo': S.string() }"
          )
        }
        return {
          ...memo,
          [prop]: Array.isArray(schema)
            ? schema
            : omit(schema.valueOf({ isRoot: false }), ['$schema', 'type', 'definitions'])
        }
      }, {})
      return setAttribute({ schema, ...options }, [
        'dependencies',
        values,
        'object'
      ])
    },

    /**
     * The value of "properties" MUST be an object. Each dependency value MUST be an array.
     * Each element in the array MUST be a string and MUST be unique. If the dependency key is a property in the instance, each of the items in the dependency value must be a property that exists in the instance.
     *
     * {@link https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.6.5.4|reference}
     * @param {object} opts
     * @returns {FluentSchema}
     */

    dependentRequired: opts => {
      const values = Object.entries(opts).reduce((memo, [prop, schema]) => {
        if (!Array.isArray(schema)) {
          throw new FluentSchemaError(
            "'dependentRequired' invalid options. Provide a valid array e.g. { 'foo': ['bar'] }"
          )
        }
        return {
          ...memo,
          [prop]: schema
        }
      }, {})

      return setAttribute({ schema, ...options }, [
        'dependentRequired',
        values,
        'object'
      ])
    },

    /**
     * The value of "properties" MUST be an object. The dependency value MUST be a valid JSON Schema.
     * Each dependency key is a property in the instance and the entire instance must validate against the dependency value.
     *
     * {@link https://json-schema.org/draft/2019-09/json-schema-core.html#rfc.section.9.2.2.4|reference}
     * @param {object} opts
     * @returns {FluentSchema}
     */
    dependentSchemas: opts => {
      const values = Object.entries(opts).reduce((memo, [prop, schema]) => {
        if (!isFluentSchema(schema)) {
          throw new FluentSchemaError(
            "'dependentSchemas' invalid options. Provide a valid schema e.g. { 'foo': S.string() }"
          )
        }

        return {
          ...memo,
          [prop]: omit(schema.valueOf({ isRoot: false }), ['$schema', 'type', 'definitions'])
        }
      }, {})

      return setAttribute({ schema, ...options }, [
        'dependentSchemas',
        values,
        'object'
      ])
    },

    /**
     * If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.
     * Note the property name that the schema is testing will always be a string.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.8|reference}
     * @param {FluentSchema} value
     * @returns {FluentSchema}
     */

    propertyNames: value => {
      if (!isFluentSchema(value)) { throw new FluentSchemaError("'propertyNames' must be a S") }
      return setAttribute({ schema, ...options }, [
        'propertyNames',
        omit(value.valueOf({ isRoot: false }), ['$schema']),
        'object'
      ])
    },

    /**
     * The value of "properties" MUST be an object. Each value of this object MUST be a valid JSON Schema.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.4|reference}
     * @param {string} name
     * @param {FluentSchema} props
     * @returns {FluentSchema}
     */

    prop: (name, props = {}) => {
      if (Array.isArray(props) || typeof props !== 'object') {
        throw new FluentSchemaError(
          `'${name}' doesn't support value '${JSON.stringify(
            props
          )}'. Pass a FluentSchema object`
        )
      }
      const target = props.def ? 'definitions' : 'properties'
      let attributes = props.valueOf({ isRoot: false })

      const { $ref, $id: attributeId, required, ...restAttributes } = attributes
      const $id =
        attributeId ||
        (options.generateIds ? `#${target}/${name}` : undefined)
      if (isFluentSchema(props)) {
        attributes = patchIdsWithParentId({
          schema: attributes,
          parentId: $id,
          ...options
        })

        const [schemaPatched, attributesPatched] = appendRequired({
          schema,
          attributes: {
            ...attributes,
            name
          }
        })

        schema = schemaPatched
        attributes = attributesPatched
      }

      const type = hasCombiningKeywords(attributes)
        ? undefined
        : attributes.type

      // strip undefined values or empty arrays or internals
      attributes = Object.entries({ ...attributes, $id, type }).reduce(
        (memo, [key, value]) => {
          return key === '$schema' ||
            key === 'def' ||
            value === undefined ||
            (Array.isArray(value) && value.length === 0 && key !== 'default')
            ? memo
            : { ...memo, [key]: value }
        },
        {}
      )

      return ObjectSchema({
        schema: {
          ...schema,
          [target]: [
            ...schema[target],
            $ref ? { name, $ref, ...restAttributes } : { name, ...attributes }
          ]
        },
        ...options
      })
    },

    extend: base => {
      if (!base) {
        throw new FluentSchemaError("Schema can't be null or undefined")
      }
      if (!base.isFluentSchema) {
        throw new FluentSchemaError("Schema isn't FluentSchema type")
      }
      const src = base._getState()
      const extended = combineDeepmerge(src, schema)
      const {
        valueOf,
        isFluentSchema,
        FLUENT_SCHEMA,
        _getState,
        extend
      } = ObjectSchema({ schema: extended, ...options })
      return { valueOf, isFluentSchema, FLUENT_SCHEMA, _getState, extend }
    },

    /**
     * Returns an object schema with only a subset of keys provided. If called on an ObjectSchema with an
     * `$id`, it will be removed and the return value will be considered a new schema.
     *
     * @param properties a list of properties you want to keep
     * @returns {ObjectSchema}
     */
    only: properties => {
      return ObjectSchema({
        schema: {
          ...omit(schema, ['$id', 'properties']),
          properties: schema.properties.filter(({ name }) => properties.includes(name)),
          required: schema.required.filter(p => properties.includes(p))
        },
        ...options
      })
    },

    /**
     * Returns an object schema without a subset of keys provided. If called on an ObjectSchema with an
     * `$id`, it will be removed and the return value will be considered a new schema.
     *
     * @param properties a list of properties you dont want to keep
     * @returns {ObjectSchema}
     */
    without: properties => {
      return ObjectSchema({
        schema: {
          ...omit(schema, ['$id', 'properties']),
          properties: schema.properties.filter(({ name }) => !properties.includes(name)),
          required: schema.required.filter(p => !properties.includes(p))
        },
        ...options
      })
    },

    /**
     * The "definitions" keywords provides a standardized location for schema authors to inline re-usable JSON Schemas into a more general schema.
     * There are no restrictions placed on the values within the array.
     *
     * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.9|reference}
     * @param {string} name
     * @param {FluentSchema} props
     * @returns {FluentSchema}
     */
    // FIXME LS move to BaseSchema and remove .prop
    // TODO LS Is a definition a proper schema?
    definition: (name, props = {}) =>
      ObjectSchema({ schema, ...options }).prop(name, {
        ...props.valueOf({ isRoot: false }),
        def: true
      })
  }
}

module.exports = {
  ObjectSchema,
  default: ObjectSchema
}
