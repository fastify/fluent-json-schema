'use strict'
const {
  flat,
  omit,
  hasCombiningKeywords,
  isFluentSchema,
  last,
} = require('./utils')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

const setMeta = (schema, prop) => {
  const [key, value, type = 'string'] = prop
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

// TODO LS looking for a better name
const patchIdsWithParentId = (schema, parentId) => {
  return {
    ...schema,
    properties: Object.entries(schema.properties).reduce(
      (memo, [key, prop]) => {
        return {
          ...memo,
          [key]: {
            ...prop,
            $id: `${parentId}/${prop.$id.replace('#', '')}`, // e.g. #properties/foo/properties/bar
          },
        }
      },
      {}
    ),
  }
}

const FluentSchema = (schema = initialState) => ({
  id: $id => {
    return setMeta(schema, ['$id', $id])
  },

  title: title => {
    return setMeta(schema, ['title', title])
  },

  description: description => {
    return setMeta(schema, ['description', description])
  },

  examples: examples => {
    if (!Array.isArray(examples))
      throw new Error("'examples' must be an array e.g. ['1', 'one', 'foo']")
    return setMeta(schema, ['examples', examples])
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
      properties,
      required,
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
              type ? { type } : undefined,
              defaults ? { default: defaults } : undefined,
              title ? { title } : undefined,
              $id
                ? { $id: isFluentSchema(props) ? attributes.$id || $id : $id }
                : undefined,
              description ? { description } : undefined,
              properties ? { properties } : undefined,
              required ? { required } : undefined,
              attributes.const ? { const: attributes.const } : undefined,
              attributes.enum ? { enum: attributes.enum } : undefined,
              // compounds
              anyOf ? { anyOf } : undefined,
              oneOf ? { oneOf } : undefined,
              allOf ? { allOf } : undefined,
              not ? { not } : undefined,
              // string
              minLength ? { minLength } : undefined,
              maxLength ? { maxLength } : undefined,
              pattern ? { pattern } : undefined,
              format ? { format } : undefined,
              minimum ? { minimum } : undefined,
              maximum ? { maximum } : undefined,
              multipleOf ? { multipleOf } : undefined,
              exclusiveMaximum ? { exclusiveMaximum } : undefined,
              exclusiveMinimum ? { exclusiveMinimum } : undefined
            ),
      ],
    })
  },

  enum: values => {
    if (!Array.isArray(values))
      throw new Error("'enum' must be an array e.g. ['1', 'one', 'foo']")
    return setMeta(schema, ['enum', values, 'any'])
  },

  const: value => {
    return setMeta(schema, ['const', value, 'any'])
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

  required: () => {
    const currentProp = last(schema.properties)
    return FluentSchema({
      ...schema,
      required: [...schema.required, currentProp.name],
    })
  },

  asString: () => FluentSchema({ ...schema }).as('string'),

  minLength: min => {
    if (!Number.isInteger(min))
      throw new Error("'minLength' must be an Integer")
    return setMeta(schema, ['minLength', min, 'string'])
  },

  maxLength: max => {
    if (!Number.isInteger(max))
      throw new Error("'maxLength' must be an Integer")
    return setMeta(schema, ['maxLength', max, 'string'])
  },

  asNumber: () => FluentSchema({ ...schema }).as('number'),

  minimum: min => {
    if (!Number.isInteger(min)) throw new Error("'minimum' must be an Integer")
    return setMeta(schema, ['minimum', min, 'number'])
  },
  maximum: max => {
    if (!Number.isInteger(max)) throw new Error("'maximum' must be an Integer")
    return setMeta(schema, ['maximum', max, 'number'])
  },

  asBoolean: () => FluentSchema({ ...schema }).as('boolean'),

  asInteger: () => FluentSchema({ ...schema }).as('integer'),

  asArray: () => FluentSchema({ ...schema }).as('array'),

  asObject: () => FluentSchema({ ...schema }).as('object'),

  asNull: () => FluentSchema({ ...schema }).as('null'),

  as: type => {
    return setMeta(schema, ['type', type])
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
    const { properties, definitions, ...rest } = schema
    // TODO LS cosmetic would be nice to put if/then/else clause at final props
    return {
      definitions: flat(definitions),
      ...rest,
      properties: flat(properties),
    }
  },
})

module.exports = {
  FluentSchema,
}
