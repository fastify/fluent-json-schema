'use strict'
const {
  flat,
  omit,
  hasCombiningKeywords,
  isFluentSchema,
  last,
  patchIdsWithParentId,
  appendRequired,
  FORMATS,
  REQUIRED,
} = require('./utils')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

const setAttribute = ({ schema, ...options }, attribute) => {
  const [key, value, type = 'string'] = attribute
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    if (type !== currentProp.type && type !== 'any')
      throw new Error(
        `'${name}' as '${currentProp.type}' doesn't accept '${key}' option`
      )
    return FluentSchema({ schema, ...options }).prop(name, {
      ...props,
      [key]: value,
    })
  }
  return FluentSchema({ schema: { ...schema, [key]: value }, ...options })
}

const setComposeType = ({ prop, schemas, schema, options }) => {
  if (!(Array.isArray(schemas) && schemas.every(v => isFluentSchema(v)))) {
    throw new Error(
      `'${prop}' must be a an array of FluentSchema rather than a '${typeof schemas}'`
    )
  }

  const currentProp = last(schema.properties)
  const { name, not, type, ...props } = currentProp
  const values = schemas.map(schema => {
    const { $schema, ...props } = schema.valueOf()
    return props
  })
  const attr = {
    ...props,
    ...(not ? { not: { [prop]: values } } : { [prop]: values }),
  }
  return FluentSchema({ schema: { ...schema }, options }).prop(name, attr)
}

/**
 * Represents a FluentSchema.
 * @param {Object} [options] - Options
 * @param {FluentSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {FluentSchema}
 */

const FluentSchema = (
  { schema = initialState, ...options } = { generateIds: false }
) => ({
  /**
   * It defines a URI for the schema, and the base URI that other URI references within the schema are resolved against.
   *
   * {@link https://json-schema.org/latest/json-schema-core.html#id-keyword|reference}
   * @param {string} id - an #id
   * @returns {FluentSchema}
   */

  id: id => {
    if (!id)
      return new Error(
        `id should not be an empty fragment <#> or an empty string <> (e.g. #myId)`
      )
    return setAttribute({ schema, ...options }, ['$id', id, 'any'])
  },

  /**
   * It can be used to decorate a user interface with information about the data produced by this user interface. A title will preferably be short.
   *
   * {@link https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1|reference}
   * @param {string} title
   * @returns {FluentSchema}
   */

  title: title => {
    return setAttribute({ schema, ...options }, ['title', title, 'any'])
  },

  /**
   * It can be used to decorate a user interface with information about the data
   * produced by this user interface. A description provides explanation about
   * the purpose of the instance described by the schema.
   *
   * {@link https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1|reference}
   * @param {string} description
   * @returns {FluentSchema}
   */
  description: description => {
    return setAttribute({ schema, ...options }, [
      'description',
      description,
      'any',
    ])
  },

  /**
   * The value of this keyword MUST be an array.
   * There are no restrictions placed on the values within the array.
   *
   * {@link https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.4|reference}
   * @param {string} examples
   * @returns {FluentSchema}
   */

  examples: examples => {
    if (!Array.isArray(examples))
      throw new Error("'examples' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute({ schema, ...options }, ['examples', examples, 'any'])
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
    FluentSchema({ schema, ...options }).prop(name, {
      ...props.valueOf(),
      def: true,
    }),

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
      attributes.$id || (options.generateIds ? `#${target}/${name}` : undefined)
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

    const {
      type = hasCombiningKeywords(attributes) ? undefined : 'string',
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

    return FluentSchema({
      schema: {
        ...schema,
        [target]: [
          ...schema[target], //.filter(p => p.$id !== id),
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
                contentEncoding !== undefined ? { contentEncoding } : undefined,
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
                additionalItems !== undefined ? { additionalItems } : undefined,
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
   * The value of this keyword MUST be an array. This array SHOULD have at least one element. Elements in the array SHOULD be unique.
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2}
   * @param {array} values
   * @returns {FluentSchema}
   */

  enum: values => {
    if (!Array.isArray(values))
      throw new Error("'enum' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute({ schema, ...options }, ['enum', values, 'any'])
  },

  /**
   * The value of this keyword MAY be of any type, including null.
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.3}
   * @param value
   * @returns {FluentSchema}
   */

  const: value => {
    return setAttribute({ schema, ...options }, ['const', value, 'any'])
  },

  /**
   * There are no restrictions placed on the value of this keyword.
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.2}
   * @param defaults
   * @returns {FluentSchema}
   */

  default: defaults => {
    return setAttribute({ schema, ...options }, ['defaults', defaults, 'any'])
  },

  /**
   * Required has to be chained to a property:
   * Examples:
   * - FluentSchema().prop('prop').required()
   * - FluentSchema().prop('prop', FluentSchema().asNumber()).required()
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.3}
   * @returns {FluentSchema}
   */

  required: () => {
    const currentProp = last(schema.properties)
    const required = currentProp
      ? [...schema.required, currentProp.name]
      : [REQUIRED]
    return FluentSchema({
      schema: { ...schema, required },
      options,
    })
  },

  /**
   * Can be applied only to a not followed by a anyOf, allOf or oneOf
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.4}
   * @returns {FluentSchema}
   */

  not: () => {
    const [currentProp, ...properties] = [...schema.properties].reverse()
    if (!currentProp) throw new Error(`'not' can be applied only to a prop`)
    const { name, type, ...props } = currentProp
    const attrs = {
      ...props,
      not: {},
    }
    return FluentSchema({ schema: { ...schema, properties }, options }).prop(
      name,
      attrs
    )
  },

  /**
   * It  MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.3}
   * @param {array} schemas
   * @returns {FluentSchema}
   */

  anyOf: schemas => setComposeType({ prop: 'anyOf', schemas, schema, options }),

  /**
   * It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.1}
   * @param {array} schemas
   * @returns {FluentSchema}
   */

  allOf: schemas => setComposeType({ prop: 'allOf', schemas, schema, options }),

  /**
   * It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * @param {array} schemas
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.2}
   * @returns {FluentSchema}
   */

  oneOf: schemas => setComposeType({ prop: 'oneOf', schemas, schema, options }),

  /**
   * Set a property to type string
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asString: () => FluentSchema({ schema: { ...schema }, options }).as('string'),

  /**
   * A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
   * The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   *
   * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2}
   * @returns {FluentSchema}
   */

  minLength: min => {
    if (!Number.isInteger(min))
      throw new Error("'minLength' must be an Integer")
    return setAttribute({ schema, ...options }, ['minLength', min, 'string'])
  },

  /**
   * A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
   * The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].
   *
   * @param {number} max
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2}
   * @returns {FluentSchema}
   */

  maxLength: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxLength' must be an Integer")
    return setAttribute({ schema, ...options }, ['maxLength', max, 'string'])
  },

  /**
   * A string value can be RELATIVE_JSON_POINTER, JSON_POINTER, UUID, REGEX, IPV6, IPV4, HOSTNAME, EMAIL, URL, URI_TEMPLATE, URI_REFERENCE, URI, TIME, DATE,
   *
   * @param {string} format
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.7.3}
   * @returns {FluentSchema}
   */

  format: format => {
    if (!Object.values(FORMATS).includes(format))
      throw new Error(
        `'format' must be one of ${Object.values(FORMATS).join(', ')}`
      )
    return setAttribute({ schema, ...options }, ['format', format, 'string'])
  },

  /**
   *  This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
   *  A string instance is considered valid if the regular expression matches the instance successfully.
   *
   * @param {string} pattern
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3}
   * @returns {FluentSchema}
   */
  pattern: pattern => {
    if (!(typeof pattern === 'string') && !(pattern instanceof RegExp))
      throw new Error(`'pattern' must be a string or a RegEx (e.g. /.*/)`)

    if (pattern instanceof RegExp) {
      const flags = new RegExp(pattern).flags
      pattern = pattern
        .toString()
        .substr(1)
        .replace(`/${flags}`, '')
    }

    return setAttribute({ schema, ...options }, ['pattern', pattern, 'string'])
  },

  /**
   *  If the instance value is a string, this property defines that the string SHOULD
   *  be interpreted as binary data and decoded using the encoding named by this property.
   *  RFC 2045, Sec 6.1 [RFC2045] lists the possible values for this property.
   *
   * @param {string} encoding
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3}
   * @returns {FluentSchema}
   */

  contentEncoding: encoding => {
    if (!(typeof encoding === 'string'))
      throw new Error(`'contentEncoding' must be a string`)
    return setAttribute({ schema, ...options }, [
      'contentEncoding',
      encoding,
      'string',
    ])
  },

  /**
   *  The value of this property must be a media type, as defined by RFC 2046 [RFC2046].
   *  This property defines the media type of instances which this schema defines.
   *
   * @param {string} mediaType
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3}
   * @returns {FluentSchema}
   */

  contentMediaType: mediaType => {
    if (!(typeof mediaType === 'string'))
      throw new Error(`'contentMediaType' must be a string`)
    return setAttribute({ schema, ...options }, [
      'contentMediaType',
      mediaType,
      'string',
    ])
  },

  /**
   * Set a property to type number
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asNumber: () => FluentSchema({ schema: { ...schema }, options }).as('number'),

  /**
   * It represents  an inclusive lower limit for a numeric instance.
   *
   * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.4}
   * @returns {FluentSchema}
   */

  minimum: min => {
    if (typeof min !== 'number') throw new Error("'minimum' must be a Number")
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
      throw new Error("'multipleOf' must be an Integer")
    return setAttribute({ schema, ...options }, [
      'multipleOf',
      multiple,
      'number',
    ])
  },

  /**
   * Set a property to type boolean
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asBoolean: () =>
    FluentSchema({ schema: { ...schema }, options }).as('boolean'),

  /**
   * Set a property to type integer
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asInteger: () =>
    FluentSchema({ schema: { ...schema }, options }).as('integer'),

  /**
   * Set a property to type array
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asArray: () => FluentSchema({ schema: { ...schema }, options }).as('array'),

  /**
   * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
   * If "items" is a schema, validation succeeds if all elements in the array successfully validate against that schema.
   * If "items" is an array of schemas, validation succeeds if each element of the instance validates against the schema at the same position, if any.
   * Omitting this keyword has the same behavior as an empty schema.
   *
   * @param {FluentSchema|FluentSchema[]} items
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.1}
   * @returns {FluentSchema}
   */

  items: items => {
    if (
      !isFluentSchema(items) &&
      !(Array.isArray(items) && items.filter(v => isFluentSchema(v)).length > 0)
    )
      throw new Error(
        "'items' must be a FluentSchema or an array of FluentSchema"
      )
    if (Array.isArray(items)) {
      const values = items.map(v => {
        const { $schema, ...rest } = v.valueOf()
        return rest
      })
      return setAttribute({ schema, ...options }, ['items', values, 'array'])
    }
    const { $schema, ...rest } = items.valueOf()
    return setAttribute({ schema, ...options }, ['items', { ...rest }, 'array'])
  },

  /**
   * This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
   *
   * @param {FluentSchema|boolean} items
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.2}
   * @returns {FluentSchema}
   */

  additionalItems: items => {
    if (typeof items !== 'boolean' && !isFluentSchema(items))
      throw new Error("'additionalItems' must be a boolean or a FluentSchema")
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
   * @param {FluentSchema|boolean} value
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.2}
   * @returns {FluentSchema}
   */

  contains: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error("'contains' must be a boolean or a FluentSchema")
    if (value === false) {
      return setAttribute({ schema, ...options }, ['contains', false, 'array'])
    }
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
   * @param {boolean} boolean
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.5}
   * @returns {FluentSchema}
   */

  uniqueItems: boolean => {
    if (typeof boolean !== 'boolean')
      throw new Error("'uniqueItems' must be a boolean")
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
   * @param {number} min
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.4}
   * @returns {FluentSchema}
   */

  minItems: min => {
    if (!Number.isInteger(min)) throw new Error("'minItems' must be a integer")
    return setAttribute({ schema, ...options }, ['minItems', min, 'array'])
  },

  /**
   * An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
   * Omitting this keyword has the same behavior as a value of 0.
   *
   * @param {number} max
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.3}
   * @returns {FluentSchema}
   */

  maxItems: max => {
    if (!Number.isInteger(max)) throw new Error("'maxItems' must be a integer")
    return setAttribute({ schema, ...options }, ['maxItems', max, 'array'])
  },

  /**
   * Set a property to type object
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asObject: () => FluentSchema({ schema: { ...schema }, options }).as('object'),

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
   * @param {object} options
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.5}
   * @returns {FluentSchema}
   */

  patternProperties: options => {
    const values = Object.entries(options).reduce((memo, [pattern, schema]) => {
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
   * @param {object} options
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7}
   * @returns {FluentSchema}
   */

  dependencies: options => {
    const values = Object.entries(options).reduce((memo, [prop, schema]) => {
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
    return setAttribute({ schema, ...value.valueOf() }, [
      'propertyNames',
      omit(value.valueOf(), ['$schema']),
      'object',
    ])
  },

  /**
   * Set a property to type null
   *
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1}
   * @returns {FluentSchema}
   */

  asNull: () => FluentSchema({ schema: { ...schema }, options }).as('null'),

  /**
   * @private set a property to a type. Use asString asNumber etc.
   * @returns {FluentSchema}
   */
  as: type => {
    return setAttribute({ schema, ...options }, ['type', type])
  },

  /**
   * This validation outcome of this keyword's subschema has no direct effect on the overall validation result.
   * Rather, it controls which of the "then" or "else" keywords are evaluated.
   * When "if" is present, and the instance successfully validates against its subschema, then
   * validation succeeds against this keyword if the instance also successfully validates against this keyword's subschema.
   *
   * @param {FluentSchema} ifClause
   * @param {FluentSchema} thenClause
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.6.1}
   * @returns {FluentSchema}
   */

  ifThen: (ifClause, thenClause) => {
    if (!isFluentSchema(ifClause))
      throw new Error("'ifClause' must be a FluentSchema")
    if (!isFluentSchema(thenClause))
      throw new Error("'thenClause' must be a FluentSchema")

    const ifClauseSchema = omit(ifClause.valueOf(), [
      '$schema',
      'definitions',
      'type',
    ])
    const thenClauseSchema = omit(thenClause.valueOf(), [
      '$schema',
      'definitions',
      'type',
    ])

    return FluentSchema({
      schema: {
        ...schema,
        if: patchIdsWithParentId({
          schema: ifClauseSchema,
          ...options,
          parentId: '#if',
        }),
        then: patchIdsWithParentId({
          schema: thenClauseSchema,
          ...options,
          parentId: '#then',
        }),
      },
      ...options,
    })
  },

  /**
   * When "if" is present, and the instance fails to validate against its subschema,
   * then validation succeeds against this keyword if the instance successfully validates against this keyword's subschema.
   *
   * @param {FluentSchema} ifClause
   * @param {FluentSchema} thenClause
   * @param {FluentSchema} elseClause
   * {@link reference|https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.6.1}
   * @returns {FluentSchema}
   */

  ifThenElse: (ifClause, thenClause, elseClause) => {
    if (!isFluentSchema(ifClause))
      throw new Error("'ifClause' must be a FluentSchema")
    if (!isFluentSchema(thenClause))
      throw new Error("'thenClause' must be a FluentSchema")
    if (!isFluentSchema(elseClause))
      throw new Error(
        "'elseClause' must be a FluentSchema or a false boolean value"
      )
    const ifClauseSchema = omit(ifClause.valueOf(), [
      '$schema',
      'definitions',
      'type',
    ])
    const thenClauseSchema = omit(thenClause.valueOf(), [
      '$schema',
      'definitions',
      'type',
    ])
    const elseClauseSchema = omit(elseClause.valueOf(), [
      '$schema',
      'definitions',
      'type',
    ])

    return FluentSchema({
      schema: {
        ...schema,
        if: patchIdsWithParentId({
          schema: ifClauseSchema,
          ...options,
          parentId: '#if',
        }),
        then: patchIdsWithParentId({
          schema: thenClauseSchema,
          ...options,
          parentId: '#then',
        }),
        else: patchIdsWithParentId({
          schema: elseClauseSchema,
          ...options,
          parentId: '#else',
        }),
      },
      ...options,
    })
  },

  /**
   * It returns all the schema values
   *
   * @returns {object}
   */
  valueOf: () => {
    const { properties, definitions, required, $schema, ...rest } = schema
    return Object.assign(
      { $schema },
      Object.keys(definitions).length > 0
        ? { definitions: flat(definitions) }
        : undefined,
      { ...omit(rest, ['if', 'then', 'else']) },
      Object.keys(properties).length > 0
        ? { properties: flat(properties) }
        : undefined,
      required.length > 0 ? { required } : undefined,
      schema.if ? { if: schema.if } : undefined,
      schema.then ? { then: schema.then } : undefined,
      schema.else ? { else: schema.else } : undefined
    )
  },
})

module.exports = {
  FluentSchema,
  FORMATS,
  default: FluentSchema,
}
