'use strict'
const isFluentSchema = obj => typeof obj.anyOf === 'function'

const hasCombiningKeywords = attributes =>
  attributes.allOf || attributes.anyOf || attributes.oneOf || attributes.not

const last = array => {
  const [prop] = [...array].reverse()
  return prop
}

const omit = (obj, props) =>
  Object.entries(obj).reduce((memo, [key, value]) => {
    if (props.includes(key)) return memo
    return {
      ...memo,
      [key]: value,
    }
  }, {})

const deepOmit = (obj, props) =>
  Object.entries(obj).reduce((memo, [key, value]) => {
    if (props.includes(key)) return memo
    return {
      ...memo,
      [key]:
        typeof value === 'object' && !Array.isArray(value)
          ? deepOmit(value, props)
          : value,
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
}

// TODO LS looking for a better name
const patchIdsWithParentId = ({ schema, generateIds, parentId }) => {
  const properties = Object.entries(schema.properties || {})
  return properties.length === 0
    ? {
        ...schema,
        $id: parentId,
      }
    : {
        ...schema,
        properties: properties.reduce((memo, [key, props]) => {
          return !props.$id
            ? {
                ...memo,
                [key]: {
                  ...props,
                },
              }
            : {
                ...memo,
                [key]: {
                  ...props,
                  $id: generateIds
                    ? `${parentId}/${props.$id.replace('#', '')}`
                    : props.$id, // e.g. #properties/foo/properties/bar
                },
              }
        }, {}),
      }
}

module.exports = {
  isFluentSchema,
  hasCombiningKeywords,
  last,
  flat,
  omit,
  deepOmit,
  patchIdsWithParentId,
  FORMATS,
}
