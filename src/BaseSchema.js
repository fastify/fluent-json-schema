'use strict'
const {
  flat,
  omit,
  isFluentSchema,
  last,
  isUniq,
  patchIdsWithParentId,
  REQUIRED,
  setAttribute,
  setRaw,
  setComposeType,
  FluentSchemaError,
  FLUENT_SCHEMA,
} = require('./utils')

const initialState = {
  properties: [],
  required: [],
}

/**
 * Represents a BaseSchema.
 * @param {Object} [options] - Options
 * @param {BaseSchema} [options.schema] - Default schema
 * @param {boolean} [options.generateIds = false] - generate the id automatically e.g. #properties.foo
 * @returns {BaseSchema}
 */

const BaseSchema = (
  { schema = initialState, ...options } = {
    generateIds: false,
    factory: BaseSchema,
  }
) => ({
  [FLUENT_SCHEMA]: true,
  isFluentSchema: true,
  isFluentJSONSchema: true,

  /**
   * It defines a URI for the schema, and the base URI that other URI references within the schema are resolved against.
   *
   * {@link https://tools.ietf.org/html/draft-handrews-json-schema-01#section-8.2|reference}
   * @param {string} id - an #id
   * @returns {BaseSchema}
   */

  id: id => {
    if (!id)
      throw new FluentSchemaError(
        `id should not be an empty fragment <#> or an empty string <> (e.g. #myId)`
      )
    return setAttribute({ schema, ...options }, ['$id', id, 'any'])
  },

  /**
   * It can be used to decorate a user interface with information about the data produced by this user interface. A title will preferably be short.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.1|reference}
   * @param {string} title
   * @returns {BaseSchema}
   */

  title: title => {
    return setAttribute({ schema, ...options }, ['title', title, 'any'])
  },

  /**
   * It can be used to decorate a user interface with information about the data
   * produced by this user interface. A description provides explanation about
   * the purpose of the instance described by the schema.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.1|reference}
   * @param {string} description
   * @returns {BaseSchema}
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
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.4|reference}
   * @param {string} examples
   * @returns {BaseSchema}
   */

  examples: examples => {
    if (!Array.isArray(examples))
      throw new FluentSchemaError(
        "'examples' must be an array e.g. ['1', 'one', 'foo']"
      )
    return setAttribute({ schema, ...options }, ['examples', examples, 'any'])
  },

  /**
   * The value must be a valid id e.g. #properties/foo
   *
   * @param {string} ref
   * @returns {BaseSchema}
   */

  ref: ref => {
    return setAttribute({ schema, ...options }, ['$ref', ref, 'any'])
  },

  /**
   * The value of this keyword MUST be an array. This array SHOULD have at least one element. Elements in the array SHOULD be unique.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.1.2|reference}
   * @param {array} values
   * @returns {BaseSchema}
   */

  enum: values => {
    if (!Array.isArray(values))
      throw new FluentSchemaError(
        "'enums' must be an array with at least an element e.g. ['1', 'one', 'foo']"
      )
    return setAttribute({ schema, ...options }, ['enum', values, 'any'])
  },

  /**
   * The value of this keyword MAY be of any type, including null.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.1.3|reference}
   * @param value
   * @returns {BaseSchema}
   */

  const: value => {
    return setAttribute({ schema, ...options }, ['const', value, 'any'])
  },

  /**
   * There are no restrictions placed on the value of this keyword.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.2|reference}
   * @param defaults
   * @returns {BaseSchema}
   */

  default: defaults => {
    return setAttribute({ schema, ...options }, ['default', defaults, 'any'])
  },

  /**
   * The value of readOnly can be left empty to indicate the property is readOnly.
   * It takes an optional boolean which can be used to explicitly set readOnly true/false.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.3|reference}
   * @param {boolean|undefined} isReadOnly
   * @returns {BaseSchema}
   */

  readOnly: isReadOnly => {
    const value = isReadOnly !== undefined ? isReadOnly : true
    return setAttribute({ schema, ...options }, ['readOnly', value, 'boolean'])
  },

  /**
   * The value of writeOnly can be left empty to indicate the property is writeOnly.
   * It takes an optional boolean which can be used to explicitly set writeOnly true/false.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.10.3|reference}
   * @param {boolean|undefined} isWriteOnly
   * @returns {BaseSchema}
   */

  writeOnly: isWriteOnly => {
    const value = isWriteOnly !== undefined ? isWriteOnly : true
    return setAttribute({ schema, ...options }, ['writeOnly', value, 'boolean'])
  },

  /**
   * Required has to be chained to a property:
   * Examples:
   * - S.prop('prop').required()
   * - S.prop('prop', S.number()).required()
   * - S.required(['foo', 'bar'])
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.5.3|reference}
   * @returns {FluentSchema}
   */
  required: props => {
    const currentProp = last(schema.properties)
    const required = Array.isArray(props)
      ? [...schema.required, ...props]
      : currentProp
      ? [...schema.required, currentProp.name]
      : [REQUIRED]
    
    if(!isUniq(required)){
      throw new FluentSchemaError("'required' has repeated keys, check your calls to require()")
    }

    return options.factory({
      schema: { ...schema, required },
      ...options,
    })
  },

  /**
   * This keyword's value MUST be a valid JSON Schema.
   * An instance is valid against this keyword if it fails to validate successfully against the schema defined by this keyword.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.7.4|reference}
   * @param {FluentSchema} not
   * @returns {BaseSchema}
   */
  not: not => {
    if (!isFluentSchema(not))
      throw new FluentSchemaError("'not' must be a BaseSchema")
    const notSchema = omit(not.valueOf(), ['$schema', 'definitions'])

    return BaseSchema({
      schema: {
        ...schema,
        not: patchIdsWithParentId({
          schema: notSchema,
          ...options,
          parentId: '#not',
        }),
      },
      ...options,
    })
  },
  // return setAttribute({ schema, ...options }, ['defaults', defaults, 'any'])

  /**
   * It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.7.2|reference}
   * @param {array} schemas
   * @returns {BaseSchema}
   */

  anyOf: schemas => setComposeType({ prop: 'anyOf', schemas, schema, options }),

  /**
   * It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.7.1|reference}
   * @param {array} schemas
   * @returns {BaseSchema}
   */

  allOf: schemas => setComposeType({ prop: 'allOf', schemas, schema, options }),

  /**
   * It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
   *
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.7.3|reference}
   * @param {array} schemas
   * @returns {BaseSchema}
   */

  oneOf: schemas => setComposeType({ prop: 'oneOf', schemas, schema, options }),

  /**
   * @private set a property to a type. Use string number etc.
   * @returns {BaseSchema}
   */
  as: type => setAttribute({ schema, ...options }, ['type', type]),

  /**
   * This validation outcome of this keyword's subschema has no direct effect on the overall validation result.
   * Rather, it controls which of the "then" or "else" keywords are evaluated.
   * When "if" is present, and the instance successfully validates against its subschema, then
   * validation succeeds against this keyword if the instance also successfully validates against this keyword's subschema.
   *
   * @param {BaseSchema} ifClause
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.6.1|reference}
   * @param {BaseSchema} thenClause
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.6.2|reference}
   * @returns {BaseSchema}
   */

  ifThen: (ifClause, thenClause) => {
    if (!isFluentSchema(ifClause))
      throw new FluentSchemaError("'ifClause' must be a BaseSchema")
    if (!isFluentSchema(thenClause))
      throw new FluentSchemaError("'thenClause' must be a BaseSchema")

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

    return options.factory({
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
   * @param {BaseSchema} ifClause
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.6.1|reference}
   * @param {BaseSchema} thenClause
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.6.2|reference}
   * @param {BaseSchema} elseClause
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.6.3|reference}
   * @returns {BaseSchema}
   */

  ifThenElse: (ifClause, thenClause, elseClause) => {
    if (!isFluentSchema(ifClause))
      throw new FluentSchemaError("'ifClause' must be a BaseSchema")
    if (!isFluentSchema(thenClause))
      throw new FluentSchemaError("'thenClause' must be a BaseSchema")
    if (!isFluentSchema(elseClause))
      throw new FluentSchemaError(
        "'elseClause' must be a BaseSchema or a false boolean value"
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

    return options.factory({
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
   * Because the differences between JSON Schemas and Open API (Swagger)
   * it can be handy to arbitrary modify the schema injecting a fragment
   *
   * * Examples:
   * - S.number().raw({ nullable:true })
   * - S.string().format('date').raw({ formatMaximum: '2020-01-01' })
   *
   * @param {string} fragment an arbitrary JSON Schema to inject
   * {@link https://tools.ietf.org/id/draft-handrews-json-schema-validation-01.html#rfc.section.6.3.3|reference}
   * @returns {BaseSchema}
   */
  raw: fragment => {
    return setRaw({ schema, ...options }, fragment)
  },

  /**
   * @private It returns the internal schema data structure
   * @returns {object}
   */
  // TODO LS if we implement S.raw() we can drop this hack because from a JSON we can rebuild a fluent-json-schema
  _getState: () => {
    return schema
  },

  /**
   * It returns all the schema values
   *
   * @returns {object}
   */
  valueOf: () => {
    const { properties, definitions, required, $schema, ...rest } = schema
    return Object.assign(
      $schema ? { $schema } : {},
      Object.keys(definitions || []).length > 0
        ? { definitions: flat(definitions) }
        : undefined,
      { ...omit(rest, ['if', 'then', 'else']) },
      Object.keys(properties || []).length > 0
        ? { properties: flat(properties) }
        : undefined,
      required && required.length > 0 ? { required } : undefined,
      schema.if ? { if: schema.if } : undefined,
      schema.then ? { then: schema.then } : undefined,
      schema.else ? { else: schema.else } : undefined
    )
  },
})

module.exports = {
  BaseSchema,
  default: BaseSchema,
}
