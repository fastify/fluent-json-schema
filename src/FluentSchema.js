'use strict'
const {
  flat,
  omit,
  hasCombiningKeywords,
  isFluentSchema,
  last,
  patchIdsWithParentId,
  FORMATS,
} = require('./utils')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

const setAttribute = (schema, attribute) => {
  const [key, value, type = 'string'] = attribute
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    if (type !== currentProp.type && type !== 'any')
      throw new Error(
        `'${name}' as '${currentProp.type}' doesn't accept '${key}' option`
      )
    return FluentSchema({ ...schema }).prop(name, { ...props, [key]: value })
  }
  return FluentSchema({ ...schema, [key]: value })
}

const FluentSchema = (schema = initialState) => ({
  id: $id => {
    return setAttribute(schema, ['$id', $id, 'any'])
  },

  title: title => {
    return setAttribute(schema, ['title', title, 'any'])
  },

  description: description => {
    return setAttribute(schema, ['description', description, 'any'])
  },

  examples: examples => {
    if (!Array.isArray(examples))
      throw new Error("'examples' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute(schema, ['examples', examples, 'any'])
  },

  ref: $ref => {
    const currentProp = last(schema.properties)
    if (currentProp) {
      const { name } = currentProp
      return FluentSchema({ ...schema }).prop(name, { $ref })
    }
    // TODO LS not sure if a schema can have a $ref
    return FluentSchema({ ...schema, $ref })
  },

  definition: (name, props = {}) =>
    FluentSchema({ ...schema }).prop(name, { ...props, def: true }),

  prop: (name, props = {}) => {
    const target = props.def ? 'definitions' : 'properties'
    const $id = `#${target}/${name}`
    const attributes = isFluentSchema(props)
      ? patchIdsWithParentId(props.valueOf(), $id)
      : props

    const {
      type = hasCombiningKeywords(attributes) ? undefined : 'string',
      // TODO LS $id should be prefixed with the parent.
      // Resolving this fix the if issue as well
      // Do we need an id for each prop? https://www.jsonschema.net/ foster for this approach however ifClause is generating a duplicated if
      //$id = `#${target}/${name}`,
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
      ...schema,
      [target]: [
        ...schema[target].filter(p => p.$id !== $id),
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
              $id ? { $id: attributes.$id || $id } : undefined,
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
              // number
              minimum !== undefined ? { minimum } : undefined,
              maximum !== undefined ? { maximum } : undefined,
              multipleOf !== undefined ? { multipleOf } : undefined,
              exclusiveMaximum !== undefined ? { exclusiveMaximum } : undefined,
              exclusiveMinimum !== undefined ? { exclusiveMinimum } : undefined,
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
              required !== undefined ? { required } : undefined,
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
    })
  },

  enum: values => {
    if (!Array.isArray(values))
      throw new Error("'enum' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute(schema, ['enum', values, 'any'])
  },

  const: value => {
    return setAttribute(schema, ['const', value, 'any'])
  },

  default: defaults => {
    return setAttribute(schema, ['defaults', defaults, 'any'])
  },

  required: () => {
    const currentProp = last(schema.properties)
    if (!currentProp)
      throw new Error(
        "'required' has to be chained to a prop: \nExamples: \n- FluentSchema().prop('prop').required() \n- FluentSchema().prop('prop', FluentSchema().asNumber()).required()"
      )
    return FluentSchema({
      ...schema,
      required: [...schema.required, currentProp.name],
    })
  },

  not: () => {
    const [currentProp, ...properties] = [...schema.properties].reverse()
    if (!currentProp) throw new Error(`'not' can be applied only to a prop`)
    const { name, type, ...props } = currentProp
    const attrs = {
      ...props,
      not: {},
    }
    return FluentSchema({ ...schema, properties }).prop(name, attrs)
  },

  anyOf: attributes => {
    const currentProp = last(schema.properties)
    const { name, not, type, ...props } = currentProp
    const properties = attributes.valueOf().properties
    const values = Object.entries(properties).reduce((memo, [key, value]) => {
      return [...memo, value]
    }, [])
    const attr = {
      ...props,
      ...(not ? { not: { anyOf: values } } : { anyOf: values }),
    }
    return FluentSchema({ ...schema }).prop(name, attr)
  },

  allOf: attributes => {
    const currentProp = last(schema.properties)
    const { name, not, type, ...props } = currentProp
    const properties = attributes.valueOf().properties
    const values = Object.entries(properties).reduce((memo, [key, value]) => {
      return [...memo, value]
    }, [])
    const attr = {
      ...props,
      ...(not ? { not: { allOf: values } } : { allOf: values }),
    }
    return FluentSchema({ ...schema }).prop(name, attr)
  },

  oneOf: attributes => {
    const currentProp = last(schema.properties)
    const { name, not, type, ...props } = currentProp
    const properties = attributes.valueOf().properties
    const values = Object.entries(properties).reduce((memo, [key, value]) => {
      return [...memo, value]
    }, [])
    const attr = {
      ...props,
      ...(not ? { not: { oneOf: values } } : { oneOf: values }),
    }
    return FluentSchema({ ...schema }).prop(name, attr)
  },

  asString: () => FluentSchema({ ...schema }).as('string'),

  minLength: min => {
    if (!Number.isInteger(min))
      throw new Error("'minLength' must be an Integer")
    return setAttribute(schema, ['minLength', min, 'string'])
  },

  maxLength: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxLength' must be an Integer")
    return setAttribute(schema, ['maxLength', max, 'string'])
  },

  format: format => {
    if (!Object.values(FORMATS).includes(format))
      throw new Error(
        `'format' must be one of ${Object.values(FORMATS).join(', ')}`
      )
    return setAttribute(schema, ['format', format, 'string'])
  },
  // TODO LS accept regex as well
  pattern: pattern => {
    if (!typeof pattern === 'string')
      throw new Error(`'pattern' must be a string`)
    return setAttribute(schema, ['pattern', pattern, 'string'])
  },

  asNumber: () => FluentSchema({ ...schema }).as('number'),

  minimum: min => {
    if (typeof min !== 'number') throw new Error("'minimum' must be a Number")
    return setAttribute(schema, ['minimum', min, 'number'])
  },

  exclusiveMinimum: max => {
    if (typeof max !== 'number')
      throw new Error("'exclusiveMinimum' must be a Number")
    return setAttribute(schema, ['exclusiveMinimum', max, 'number'])
  },

  maximum: max => {
    if (typeof max !== 'number') throw new Error("'maximum' must be a Number")
    return setAttribute(schema, ['maximum', max, 'number'])
  },

  exclusiveMaximum: max => {
    if (typeof max !== 'number')
      throw new Error("'exclusiveMaximum' must be an Integer")
    return setAttribute(schema, ['exclusiveMaximum', max, 'number'])
  },

  multipleOf: multiple => {
    if (typeof multiple !== 'number')
      throw new Error("'multipleOf' must be an Integer")
    return setAttribute(schema, ['multipleOf', multiple, 'number'])
  },

  asBoolean: () => FluentSchema({ ...schema }).as('boolean'),

  asInteger: () => FluentSchema({ ...schema }).as('integer'),

  asArray: () => FluentSchema({ ...schema }).as('array'),

  items: value => {
    if (
      !isFluentSchema(value) &&
      !(Array.isArray(value) && value.filter(v => isFluentSchema(v)).length > 0)
    )
      throw new Error(
        "'items' must be a FluentSchema or an array of FluentSchema"
      )
    if (Array.isArray(value)) {
      const values = value.map(v => {
        const { $schema, ...rest } = v.valueOf()
        return rest
      })
      return setAttribute(schema, ['items', values, 'array'])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute(schema, ['items', { ...rest }, 'array'])
  },

  additionalItems: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error("'additionalItems' must be a boolean or a FluentSchema")
    if (value === false) {
      return setAttribute(schema, ['additionalItems', false, 'array'])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute(schema, ['additionalItems', { ...rest }, 'array'])
  },

  contains: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error("'contains' must be a boolean or a FluentSchema")
    if (value === false) {
      return setAttribute(schema, ['contains', false, 'array'])
    }
    const {
      $schema,
      definitions,
      properties,
      required,
      ...rest
    } = value.valueOf()
    return setAttribute(schema, ['contains', { ...rest }, 'array'])
  },

  uniqueItems: boolean => {
    if (typeof boolean !== 'boolean')
      throw new Error("'uniqueItems' must be a boolean")
    return setAttribute(schema, ['uniqueItems', boolean, 'array'])
  },

  minItems: min => {
    if (!Number.isInteger(min)) throw new Error("'minItems' must be a integer")
    return setAttribute(schema, ['minItems', min, 'array'])
  },

  maxItems: max => {
    if (!Number.isInteger(max)) throw new Error("'maxItems' must be a integer")
    return setAttribute(schema, ['maxItems', max, 'array'])
  },

  asObject: () => FluentSchema({ ...schema }).as('object'),

  additionalProperties: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error(
        "'additionalProperties' must be a boolean or a FluentSchema"
      )
    if (value === false) {
      return setAttribute(schema, ['additionalProperties', false, 'object'])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute(schema, ['additionalProperties', { ...rest }, 'array'])
  },

  maxProperties: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxProperties' must be a Integer")
    return setAttribute(schema, ['maxProperties', max, 'object'])
  },

  minProperties: min => {
    if (!Number.isInteger(min))
      throw new Error("'minProperties' must be a Integer")
    return setAttribute(schema, ['minProperties', min, 'object'])
  },

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
    return setAttribute(schema, ['patternProperties', values, 'object'])
  },

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
    return setAttribute(schema, ['dependencies', values, 'object'])
  },

  propertyNames: obj => {
    if (!isFluentSchema(obj))
      throw new Error("'propertyNames' must be a FluentSchema")
    return setAttribute(schema, [
      'propertyNames',
      omit(obj.valueOf(), ['$schema']),
      'object',
    ])
  },

  asNull: () => FluentSchema({ ...schema }).as('null'),

  as: type => {
    return setAttribute(schema, ['type', type])
  },

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
      ...schema,
      if: patchIdsWithParentId(ifClauseSchema, '#if'),
      then: patchIdsWithParentId(thenClauseSchema, '#then'),
    })
  },

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
      ...schema,
      if: patchIdsWithParentId(ifClauseSchema, '#if'),
      then: patchIdsWithParentId(thenClauseSchema, '#then'),
      else: patchIdsWithParentId(elseClauseSchema, '#else'),
    })
  },

  valueOf: () => {
    const { properties, definitions, required, $schema, ...rest } = schema
    // TODO LS cosmetic would be nice to put if/then/else clause as final props
    return Object.assign(
      { $schema },
      Object.keys(definitions).length > 0
        ? { definitions: flat(definitions) }
        : undefined,
      { ...rest },
      Object.keys(properties).length > 0
        ? { properties: flat(properties) }
        : undefined,
      required.length > 0 ? { required } : undefined
    )
  },
})

module.exports = {
  FluentSchema,
  FORMATS,
  default: FluentSchema,
}
