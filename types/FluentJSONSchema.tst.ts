import { expect } from 'tstyche'

import S, { FluentSchemaError, StringSchema, NumberSchema, ArraySchema, IntegerSchema, BooleanSchema, NullSchema } from '..'

// ============================================================
// Core isFluentSchema property assertions
// ============================================================
expect(S.object().isFluentJSONSchema).type.toEqual<boolean>()
expect(S.object().isFluentSchema).type.toEqual<boolean>()

// ============================================================
// BaseSchema properties on ObjectSchema
// ============================================================
expect(S.object()).type.toHaveProperty('id')
expect(S.object()).type.toHaveProperty('title')
expect(S.object()).type.toHaveProperty('description')
expect(S.object()).type.toHaveProperty('required')
expect(S.object()).type.toHaveProperty('isFluentSchema')
expect(S.object()).type.toHaveProperty('isFluentJSONSchema')
expect(S.object()).type.toHaveProperty('allOf')
expect(S.object()).type.toHaveProperty('anyOf')
expect(S.object()).type.toHaveProperty('oneOf')
expect(S.object()).type.toHaveProperty('not')

// ============================================================
// StringSchema method chains
// ============================================================
expect(S.string().minLength(1)).type.toHaveProperty('minLength')
expect(S.string().maxLength(10)).type.toHaveProperty('maxLength')
expect(S.string().format('email')).type.toHaveProperty('format')
expect(S.string().pattern(/^\w+$/)).type.toHaveProperty('pattern')
expect(S.string().contentEncoding('base64')).type.toHaveProperty('contentEncoding')
expect(S.string().contentMediaType('image/png')).type.toHaveProperty('contentMediaType')
expect(S.string().default('default')).type.toHaveProperty('default')
expect(S.string().deprecated()).type.toHaveProperty('deprecated')

// ============================================================
// StringSchema return type
// ============================================================
expect(S.string().minLength(1)).type.toEqual<StringSchema>()
expect(S.string().format('email')).type.toEqual<StringSchema>()
expect(S.string().pattern(/^\w+$/)).type.toEqual<StringSchema>()
expect(S.string().contentEncoding('base64')).type.toEqual<StringSchema>()
expect(S.string().deprecated()).type.toEqual<StringSchema>()

// ============================================================
// NumberSchema method chains
// ============================================================
expect(S.number().minimum(0)).type.toHaveProperty('minimum')
expect(S.number().maximum(100)).type.toHaveProperty('maximum')
expect(S.number().exclusiveMinimum(0)).type.toHaveProperty('exclusiveMinimum')
expect(S.number().exclusiveMaximum(100)).type.toHaveProperty('exclusiveMaximum')
expect(S.number().multipleOf(5)).type.toHaveProperty('multipleOf')

// ============================================================
// NumberSchema return type
// ============================================================
expect(S.number().minimum(0)).type.toEqual<NumberSchema>()
expect(S.number().maximum(100)).type.toEqual<NumberSchema>()
expect(S.number().multipleOf(5)).type.toEqual<NumberSchema>()

// ============================================================
// IntegerSchema method chains
// ============================================================
expect(S.integer().minimum(0)).type.toHaveProperty('minimum')
expect(S.integer().maximum(100)).type.toHaveProperty('maximum')
expect(S.integer().multipleOf(2)).type.toHaveProperty('multipleOf')

// ============================================================
// IntegerSchema return type
// ============================================================
expect(S.integer().minimum(0)).type.toEqual<IntegerSchema>()
expect(S.integer().multipleOf(2)).type.toEqual<IntegerSchema>()

// ============================================================
// BooleanSchema
// ============================================================
expect(S.boolean()).type.toHaveProperty('boolean')
expect(S.boolean()).type.toEqual<BooleanSchema>()

// ============================================================
// NullSchema
// ============================================================
expect(S.null()).type.toHaveProperty('null')
expect(S.null()).type.toEqual<NullSchema>()

// ============================================================
// ArraySchema method chains
// ============================================================
expect(S.array().items(S.string())).type.toHaveProperty('items')
expect(S.array().additionalItems(true)).type.toHaveProperty('additionalItems')
expect(S.array().contains(S.string())).type.toHaveProperty('contains')
expect(S.array().uniqueItems(true)).type.toHaveProperty('uniqueItems')
expect(S.array().minItems(1)).type.toHaveProperty('minItems')
expect(S.array().maxItems(10)).type.toHaveProperty('maxItems')

// ============================================================
// ArraySchema return type
// ============================================================
expect(S.array().items(S.string())).type.toEqual<ArraySchema>()
expect(S.array().uniqueItems(true)).type.toEqual<ArraySchema>()

// ============================================================
// ObjectSchema method chains
// ============================================================
expect(S.object().prop('foo', S.string())).type.toHaveProperty('prop')
expect(S.object().definition('bar', S.number())).type.toHaveProperty('definition')
expect(S.object().additionalProperties(false)).type.toHaveProperty('additionalProperties')
expect(S.object().extend(S.object())).type.toHaveProperty('extend')
expect(S.object().only(['foo'])).type.toHaveProperty('only')
expect(S.object().without(['foo'])).type.toHaveProperty('without')
expect(S.object().dependentRequired({ foo: ['bar'] })).type.toHaveProperty('dependentRequired')
expect(S.object().dependentSchemas({ foo: S.object().prop('bar') })).type.toHaveProperty('dependentSchemas')
expect(S.object().maxProperties(10)).type.toHaveProperty('maxProperties')
expect(S.object().minProperties(1)).type.toHaveProperty('minProperties')

// ============================================================
// FORMATS assertions
// ============================================================
expect(S.FORMATS.EMAIL).type.toEqual<'email'>()
expect(S.FORMATS.UUID).type.toEqual<'uuid'>()
expect(S.FORMATS.DATE_TIME).type.toEqual<'date-time'>()
expect(S.FORMATS.ISO_TIME).type.toEqual<'iso-time'>()
expect(S.FORMATS.ISO_DATE_TIME).type.toEqual<'iso-date-time'>()
expect(S.FORMATS.TIME).type.toEqual<'time'>()
expect(S.FORMATS.DATE).type.toEqual<'date'>()
expect(S.FORMATS.URL).type.toEqual<'url'>()
expect(S.FORMATS.IPV4).type.toEqual<'ipv4'>()
expect(S.FORMATS.IPV6).type.toEqual<'ipv6'>()

// ============================================================
// FluentSchemaError instanceof check
// ============================================================
try {
  S.object().prop('foo', 'boom!' as any)
} catch (e) {
  if (e instanceof FluentSchemaError) {
    expect(e).type.toEqual<FluentSchemaError>()
  }
}

// ============================================================
// MixedSchema assertions
// ============================================================
expect(S.mixed(['string'])).type.toHaveProperty('minLength')
expect(S.mixed(['string', 'integer'])).type.toHaveProperty('minLength')
expect(S.mixed(['string', 'number'])).type.toHaveProperty('minimum')

// ============================================================
// Complex schema building (preserves fluency)
// ============================================================
const userSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('name', S.string())
  .prop('email', S.string().format('email'))
  .prop('age', S.number())

expect(userSchema).type.toHaveProperty('prop')
expect(userSchema).type.toHaveProperty('isFluentSchema')

// ============================================================
// Extend returns ExtendedSchema type
// ============================================================
const baseSchema = S.object().prop('createdAt', S.string())
const extendedSchema = S.object().prop('id', S.string()).extend(baseSchema)

expect(extendedSchema).type.toHaveProperty('extend')

// ============================================================
// Chained methods preserve correct types
// ============================================================
expect(S.string().minLength(5).maxLength(10).pattern(/^\w+$/).format('email'))
  .type.toEqual<StringSchema>()

expect(S.number().minimum(0).maximum(100).multipleOf(5))
  .type.toEqual<NumberSchema>()

expect(S.array().items(S.string()).minItems(1).maxItems(10))
  .type.toEqual<ArraySchema>()

// ============================================================
// Type parameter propagation (generics)
// ============================================================
type User = {
  id: string
  name: string
  email: string
}

const typedSchema = S.object<User>()
  .prop('id', S.string().format('uuid'))
  .prop('name', S.string())
  .prop('email', S.string().format('email'))

expect(typedSchema).type.toHaveProperty('prop')

// Using only/without creates subset types
const subsetSchema = typedSchema.only(['id', 'name'])

expect(subsetSchema).type.toHaveProperty('only')
