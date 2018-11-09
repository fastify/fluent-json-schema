'use strict'
const { flat, hasCombiningKeywords, isFluentSchema, last } = require('./utils')

const initialState = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: [],
  properties: [],
  required: [],
}

const setMeta = (schema, prop) => {
  const [key, value] = prop
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    return FluentSchema({ ...schema }).prop(name, { ...props, [key]: value })
  }
  return FluentSchema({ ...schema, [key]: value })
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
      throw new Error(
        "Invalid examples. Must be an array e.g. ['1', 'one', 'foo']"
      )
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
    const attributes = isFluentSchema(props) ? props.valueOf() : props
    const {
      type = hasCombiningKeywords(attributes) ? undefined : 'string',
      // TODO LS $id should be prefixed with the parent
      $id = `#${target}/${name}`,
      $ref,
      title,
      description,
      defaults,
      properties,
      required,
      anyOf,
      allOf,
      oneOf,
      not,
    } = attributes

    return FluentSchema({
      ...schema,
      [target]: [
        ...schema[target],
        $ref
          ? { name, $ref }
          : Object.assign(
              {},
              { name },
              type ? { type } : undefined,
              defaults ? { default: defaults } : undefined,
              title ? { title } : undefined,
              $id ? { $id } : undefined,
              description ? { description } : undefined,
              properties ? { properties } : undefined,
              required ? { required } : undefined,
              anyOf ? { anyOf } : undefined,
              oneOf ? { oneOf } : undefined,
              allOf ? { allOf } : undefined,
              not ? { not } : undefined
            ),
      ],
    })
  },

  not: () => {
    const [currentProp, ...properties] = [...schema.properties].reverse()
    if (!currentProp) throw new Error(`invalid 'not' target`)
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

  asNumber: () => FluentSchema({ ...schema }).as('number'),

  asBoolean: () => FluentSchema({ ...schema }).as('boolean'),

  asInteger: () => FluentSchema({ ...schema }).as('integer'),

  asArray: () => FluentSchema({ ...schema }).as('array'),

  asObject: () => FluentSchema({ ...schema }).as('object'),

  asNull: () => FluentSchema({ ...schema }).as('null'),

  as: type => {
    const currentProp = last(schema.properties)
    if (currentProp) {
      const { name, ...props } = currentProp
      return FluentSchema({ ...schema }).prop(name, {
        ...props,
        type,
      })
    }
    return FluentSchema({ ...schema, type })
  },

  if: () => {
    throw new Error(`'if' isn't implemented yet`)
  },

  then: () => {
    throw new Error(`'then' isn't implemented yet`)
  },

  else: () => {
    throw new Error(`'else' isn't implemented yet`)
  },

  valueOf: () => {
    const { properties, definitions, ...rest } = schema
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
