'use strict'
const merge = require('deepmerge')
const isFluentSchema = obj => obj && obj.isFluentSchema

const hasCombiningKeywords = attributes =>
  attributes.allOf || attributes.anyOf || attributes.oneOf || attributes.not

class FluentSchemaError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FluentSchemaError'
  }
}

const last = array => {
  if (!array) return
  const [prop] = [...array].reverse()
  return prop
}

const isUniq = array => array.filter((v, i, a) => a.indexOf(v) === i).length === array.length;

const omit = (obj, props) =>
  Object.entries(obj).reduce((memo, [key, value]) => {
    if (props.includes(key)) return memo
    return {
      ...memo,
      [key]: value,
    }
  }, {})

const flat = array =>
  array.reduce((memo, prop) => {
    const { name, ...rest } = prop
    return {
      ...memo,
      [name]: rest,
    }
  }, {})

const combineMerge = (target, source, options) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    const prop = target.find(attr => attr.name === item.name)
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(prop)) {
      const propIndex = target.findIndex(prop => prop.name === item.name)
      destination[propIndex] = merge(prop, item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}

const toArray = obj =>
  obj && Object.entries(obj).map(([key, value]) => ({ name: key, ...value }))

const REQUIRED = Symbol('required')
const FLUENT_SCHEMA = Symbol.for('fluent-schema-object')

const RELATIVE_JSON_POINTER = 'relative-json-pointer'
const JSON_POINTER = 'json-pointer'
const UUID = 'uuid'
const REGEX = 'regex'
const IPV6 = 'ipv6'
const IPV4 = 'ipv4'
const HOSTNAME = 'hostname'
const EMAIL = 'email'
const URL = 'url'
const URI_TEMPLATE = 'uri-template'
const URI_REFERENCE = 'uri-reference'
const URI = 'uri'
const TIME = 'time'
const DATE = 'date'
const DATE_TIME = 'date-time'

const FORMATS = {
  RELATIVE_JSON_POINTER,
  JSON_POINTER,
  UUID,
  REGEX,
  IPV6,
  IPV4,
  HOSTNAME,
  EMAIL,
  URL,
  URI_TEMPLATE,
  URI_REFERENCE,
  URI,
  TIME,
  DATE,
  DATE_TIME,
}

const STRING = 'string'
const NUMBER = 'number'
const BOOLEAN = 'boolean'
const INTEGER = 'integer'
const OBJECT = 'object'
const ARRAY = 'array'
const NULL = 'null'

const TYPES = {
  STRING,
  NUMBER,
  BOOLEAN,
  INTEGER,
  OBJECT,
  ARRAY,
  NULL,
}

const patchIdsWithParentId = ({ schema, generateIds, parentId }) => {
  const properties = Object.entries(schema.properties || {})
  if (properties.length === 0) return schema
  return {
    ...schema,
    properties: properties.reduce((memo, [key, props]) => {
      const target = props.def ? 'definitions' : 'properties'
      const $id = props.$id || (generateIds ? `#${target}/${key}` : undefined)
      return {
        ...memo,
        [key]: {
          ...props,
          $id:
            generateIds && parentId
              ? `${parentId}/${$id.replace('#', '')}`
              : $id, // e.g. #properties/foo/properties/bar
        },
      }
    }, {}),
  }
}

const appendRequired = ({
  attributes: { name, required, ...attributes },
  schema,
}) => {
  const { schemaRequired, attributeRequired } = (required || []).reduce(
    (memo, item) => {
      return item === REQUIRED
        ? {
            ...memo,
            // append prop name to the schema.required
            schemaRequired: [...memo.schemaRequired, name],
          }
        : {
            ...memo,
            // propagate required attributes
            attributeRequired: [...memo.attributeRequired, item],
          }
    },
    { schemaRequired: [], attributeRequired: [] }
  )

  const patchedRequired = [...schema.required, ...schemaRequired];
  if(!isUniq(patchedRequired)){
    throw new FluentSchemaError("'required' has repeated keys, check your calls to require()")
  }

  const schemaPatched = {
    ...schema,
    required: patchedRequired,
  }
  const attributesPatched = {
    ...attributes,
    required: attributeRequired,
  }
  return [schemaPatched, attributesPatched]
}

const setAttribute = ({ schema, ...options }, attribute) => {
  const [key, value] = attribute
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    return options.factory({ schema, ...options }).prop(name, {
      [key]: value,
      ...props,
    })
  }
  return options.factory({ schema: { ...schema, [key]: value }, ...options })
}

const setRaw = ({ schema, ...options }, raw) => {
  const currentProp = last(schema.properties)
  if (currentProp) {
    const { name, ...props } = currentProp
    return options.factory({ schema, ...options }).prop(name, {
      ...raw,
      ...props,
    })
  }
  return options.factory({ schema: { ...schema, ...raw }, ...options })
}
// TODO LS maybe we can just use setAttribute and remove this one
const setComposeType = ({ prop, schemas, schema, options }) => {
  if (!(Array.isArray(schemas) && schemas.every(v => isFluentSchema(v)))) {
    throw new FluentSchemaError(
      `'${prop}' must be a an array of FluentSchema rather than a '${typeof schemas}'`
    )
  }

  const values = schemas.map(schema => {
    const { $schema, ...props } = schema.valueOf()
    return props
  })

  return options.factory({ schema: { ...schema, [prop]: values }, ...options })
}

module.exports = {
  isFluentSchema,
  hasCombiningKeywords,
  FluentSchemaError,
  last,
  isUniq,
  flat,
  toArray,
  omit,
  REQUIRED,
  patchIdsWithParentId,
  appendRequired,
  setRaw,
  setAttribute,
  setComposeType,
  combineMerge,
  FORMATS,
  TYPES,
  FLUENT_SCHEMA,
}
