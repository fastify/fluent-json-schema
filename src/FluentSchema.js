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

const setAttribute = ({ schema, options }, attribute) => {
  const [key, value, type = 'string'] = attribute
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    if (type !== currentProp.type && type !== 'any')
      throw new Error(
        `'${name}' as '${currentProp.type}' doesn't accept '${key}' option`
      )
    return FluentSchema({ schema: { ...schema }, options }).prop(name, {
      ...props,
      [key]: value,
    })
  }
  return FluentSchema({ schema: { ...schema, [key]: value }, options })
}

const FluentSchema = (
  { schema = initialState, ...options } = { generateIds: false }
) => ({
  id: $id => {
    return setAttribute({ schema, options }, ['$id', $id, 'any'])
  },

  title: title => {
    return setAttribute({ schema, options }, ['title', title, 'any'])
  },

  description: description => {
    return setAttribute({ schema, options }, [
      'description',
      description,
      'any',
    ])
  },

  examples: examples => {
    if (!Array.isArray(examples))
      throw new Error("'examples' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute({ schema, options }, ['examples', examples, 'any'])
  },

  ref: $ref => {
    const currentProp = last(schema.properties)
    if (currentProp) {
      const { name } = currentProp
      return FluentSchema({ schema: { ...schema }, options }).prop(name, {
        $ref,
      })
    }
    // TODO LS not sure if a schema can have a $ref
    return FluentSchema({ ...{ schema, options }, $ref })
  },

  definition: (name, props = {}) =>
    FluentSchema({ schema: { ...schema }, options }).prop(name, {
      ...props,
      def: true,
    }),

  prop: (name, props = {}) => {
    const target = props.def ? 'definitions' : 'properties'
    const $id = `#${target}/${name}`
    // console.log('generateIds:', options.generateIds)
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
      schema: {
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
      },
      ...options,
    })
  },

  enum: values => {
    if (!Array.isArray(values))
      throw new Error("'enum' must be an array e.g. ['1', 'one', 'foo']")
    return setAttribute({ schema, options }, ['enum', values, 'any'])
  },

  const: value => {
    return setAttribute({ schema, options }, ['const', value, 'any'])
  },

  default: defaults => {
    return setAttribute({ schema, options }, ['defaults', defaults, 'any'])
  },

  required: () => {
    const currentProp = last(schema.properties)
    if (!currentProp)
      throw new Error(
        "'required' has to be chained to a prop: \nExamples: \n- FluentSchema().prop('prop').required() \n- FluentSchema().prop('prop', FluentSchema().asNumber()).required()"
      )
    return FluentSchema({
      schema: { ...schema, required: [...schema.required, currentProp.name] },
      options,
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
    return FluentSchema({ schema: { ...schema, properties }, options }).prop(
      name,
      attrs
    )
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
    return FluentSchema({ schema: { ...schema }, options }).prop(name, attr)
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
    return FluentSchema({ schema: { ...schema }, options }).prop(name, attr)
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
    return FluentSchema({ schema: { ...schema }, options }).prop(name, attr)
  },

  asString: () => FluentSchema({ schema: { ...schema }, options }).as('string'),

  minLength: min => {
    if (!Number.isInteger(min))
      throw new Error("'minLength' must be an Integer")
    return setAttribute({ schema, options }, ['minLength', min, 'string'])
  },

  maxLength: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxLength' must be an Integer")
    return setAttribute({ schema, options }, ['maxLength', max, 'string'])
  },

  format: format => {
    if (!Object.values(FORMATS).includes(format))
      throw new Error(
        `'format' must be one of ${Object.values(FORMATS).join(', ')}`
      )
    return setAttribute({ schema, options }, ['format', format, 'string'])
  },
  // TODO LS accept regex as well
  pattern: pattern => {
    if (!typeof pattern === 'string')
      throw new Error(`'pattern' must be a string`)
    return setAttribute({ schema, options }, ['pattern', pattern, 'string'])
  },

  asNumber: () => FluentSchema({ schema: { ...schema }, options }).as('number'),

  minimum: min => {
    if (typeof min !== 'number') throw new Error("'minimum' must be a Number")
    return setAttribute({ schema, options }, ['minimum', min, 'number'])
  },

  exclusiveMinimum: max => {
    if (typeof max !== 'number')
      throw new Error("'exclusiveMinimum' must be a Number")
    return setAttribute({ schema, options }, [
      'exclusiveMinimum',
      max,
      'number',
    ])
  },

  maximum: max => {
    if (typeof max !== 'number') throw new Error("'maximum' must be a Number")
    return setAttribute({ schema, options }, ['maximum', max, 'number'])
  },

  exclusiveMaximum: max => {
    if (typeof max !== 'number')
      throw new Error("'exclusiveMaximum' must be an Integer")
    return setAttribute({ schema, options }, [
      'exclusiveMaximum',
      max,
      'number',
    ])
  },

  multipleOf: multiple => {
    if (typeof multiple !== 'number')
      throw new Error("'multipleOf' must be an Integer")
    return setAttribute({ schema, options }, ['multipleOf', multiple, 'number'])
  },

  asBoolean: () =>
    FluentSchema({ schema: { ...schema }, options }).as('boolean'),

  asInteger: () =>
    FluentSchema({ schema: { ...schema }, options }).as('integer'),

  asArray: () => FluentSchema({ schema: { ...schema }, options }).as('array'),

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
      return setAttribute({ schema, options }, ['items', values, 'array'])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute({ schema, options }, ['items', { ...rest }, 'array'])
  },

  additionalItems: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error("'additionalItems' must be a boolean or a FluentSchema")
    if (value === false) {
      return setAttribute({ schema, options }, [
        'additionalItems',
        false,
        'array',
      ])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute({ schema, options }, [
      'additionalItems',
      { ...rest },
      'array',
    ])
  },

  contains: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error("'contains' must be a boolean or a FluentSchema")
    if (value === false) {
      return setAttribute({ schema, options }, ['contains', false, 'array'])
    }
    const {
      $schema,
      definitions,
      properties,
      required,
      ...rest
    } = value.valueOf()
    return setAttribute({ schema, options }, ['contains', { ...rest }, 'array'])
  },

  uniqueItems: boolean => {
    if (typeof boolean !== 'boolean')
      throw new Error("'uniqueItems' must be a boolean")
    return setAttribute({ schema, options }, ['uniqueItems', boolean, 'array'])
  },

  minItems: min => {
    if (!Number.isInteger(min)) throw new Error("'minItems' must be a integer")
    return setAttribute({ schema, options }, ['minItems', min, 'array'])
  },

  maxItems: max => {
    if (!Number.isInteger(max)) throw new Error("'maxItems' must be a integer")
    return setAttribute({ schema, options }, ['maxItems', max, 'array'])
  },

  asObject: () => FluentSchema({ schema: { ...schema }, options }).as('object'),

  additionalProperties: value => {
    if (typeof value !== 'boolean' && !isFluentSchema(value))
      throw new Error(
        "'additionalProperties' must be a boolean or a FluentSchema"
      )
    if (value === false) {
      return setAttribute({ schema, options }, [
        'additionalProperties',
        false,
        'object',
      ])
    }
    const { $schema, ...rest } = value.valueOf()
    return setAttribute({ schema, options }, [
      'additionalProperties',
      { ...rest },
      'array',
    ])
  },

  maxProperties: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxProperties' must be a Integer")
    return setAttribute({ schema, options }, ['maxProperties', max, 'object'])
  },

  minProperties: min => {
    if (!Number.isInteger(min))
      throw new Error("'minProperties' must be a Integer")
    return setAttribute({ schema, options }, ['minProperties', min, 'object'])
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
    return setAttribute({ schema, options }, [
      'patternProperties',
      values,
      'object',
    ])
  },

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
    return setAttribute({ schema, options }, ['dependencies', values, 'object'])
  },

  propertyNames: obj => {
    if (!isFluentSchema(obj))
      throw new Error("'propertyNames' must be a FluentSchema")
    return setAttribute({ schema, options }, [
      'propertyNames',
      omit(obj.valueOf(), ['$schema']),
      'object',
    ])
  },

  asNull: () => FluentSchema({ schema: { ...schema }, options }).as('null'),

  as: type => {
    return setAttribute({ schema, options }, ['type', type])
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
      schema: {
        ...schema,
        if: patchIdsWithParentId(ifClauseSchema, '#if'),
        then: patchIdsWithParentId(thenClauseSchema, '#then'),
      },
      options,
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
      schema: {
        ...schema,
        if: patchIdsWithParentId(ifClauseSchema, '#if'),
        then: patchIdsWithParentId(thenClauseSchema, '#then'),
        else: patchIdsWithParentId(elseClauseSchema, '#else'),
      },
      options,
    })
  },

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
