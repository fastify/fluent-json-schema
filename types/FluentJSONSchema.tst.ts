import { expect } from 'tstyche'

import S, { FluentSchemaError } from '..'

// isFluentJSONSchema and isFluentSchema properties
expect(S.object().isFluentJSONSchema).type.toBe<boolean>()
expect(S.object().isFluentSchema).type.toBe<boolean>()

const schema = S.object()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    S.object()
      .id('#address')
      .prop('line1', S.anyOf([S.string(), S.null()])) // JSON Schema nullable
      .prop('line2', S.string().raw({ nullable: true })) // Open API / Swagger  nullable
      .prop('country')
      .allOf([S.string()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username', S.string().pattern(/[a-z]*/g))
  .prop('email', S.string().format('email'))
  .prop('email2', S.string().format(S.FORMATS.EMAIL))
  .prop(
    'avatar',
    S.string().contentEncoding('base64').contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    S.string().default('123456').minLength(6).maxLength(12).pattern('.*')
  )
  .required()
  .prop('addresses', S.array().items([S.ref('#address')]))
  .required()
  .prop(
    'role',
    S.object()
      .id('http://foo.com/role')
      .prop('name')
      .enum(['ADMIN', 'USER'])
      .prop('permissions')
  )
  .required()
  .prop('age', S.mixed(['string', 'integer']))
  .ifThen(S.object().prop('age', S.string()), S.required(['age']))
  .readOnly()
  .writeOnly(true)

// Assertions for schema methods BEFORE valueOf
expect(schema).type.toHaveProperty('id')
expect(schema).type.toHaveProperty('title')
expect(schema).type.toHaveProperty('description')
expect(schema).type.toHaveProperty('definition')
expect(schema).type.toHaveProperty('prop')
expect(schema).type.toHaveProperty('required')
expect(schema).type.toHaveProperty('isFluentSchema')
expect(schema).type.toHaveProperty('readOnly')
expect(schema).type.toHaveProperty('writeOnly')

// String method chain assertions
expect(S.string().pattern(/[a-z]*/g)).type.toHaveProperty('pattern')
expect(S.string().format('email')).type.toHaveProperty('format')
expect(S.string().format(S.FORMATS.EMAIL)).type.toHaveProperty('format')
expect(S.string().contentEncoding('base64')).type.toHaveProperty('contentEncoding')
expect(S.string().contentMediaType('image/png')).type.toHaveProperty('contentMediaType')
expect(S.string().minLength(6)).type.toHaveProperty('minLength')
expect(S.string().maxLength(12)).type.toHaveProperty('maxLength')
expect(S.string().default('123456')).type.toHaveProperty('default')

expect(schema.valueOf()).type.toBe<Object>()
expect(S.object().isFluentSchema).type.toBe<boolean>()

const userBaseSchema = S.object()
  .additionalProperties(false)
  .prop('username', S.string())
  .prop('password', S.string())

// ObjectSchema methods assertions
expect(userBaseSchema).type.toHaveProperty('additionalProperties')
expect(userBaseSchema).type.toHaveProperty('prop')

const userSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))
  .extend(userBaseSchema)

expect(userSchema).type.toHaveProperty('extend')

expect(userSchema.valueOf()).type.toBe<Object>()

const largeUserSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('username', S.string())
  .prop('password', S.string())
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const userSubsetSchema = largeUserSchema.only(['username', 'password'])

expect(userSubsetSchema.valueOf()).type.toBe<Object>()
expect(userSubsetSchema).type.toHaveProperty('only')

const personSchema = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const bodySchema = personSchema.without(['createdAt', 'updatedAt'])

expect(bodySchema.valueOf()).type.toBe<Object>()
expect(bodySchema).type.toHaveProperty('without')

const personSchemaAllowsUnix = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.mixed(['string', 'integer']).format('time'))
  .prop('updatedAt', S.mixed(['string', 'integer']).minimum(0))

expect(personSchemaAllowsUnix.valueOf()).type.toBe<Object>()
expect(personSchemaAllowsUnix).type.toHaveProperty('prop')

try {
  S.object().prop('foo', 'boom!' as any)
} catch (e) {
  if (e instanceof FluentSchemaError) {
    expect(e.message).type.toBe<string>()
    expect(e).type.toBe<FluentSchemaError>()
  }
}

const arrayExtendedSchema = S.array().items(userSchema)

expect(arrayExtendedSchema.valueOf()).type.toBe<Object>()
expect(arrayExtendedSchema).type.toHaveProperty('items')

const extendExtendedSchema = S.object().extend(userSchema)

expect(extendExtendedSchema.valueOf()).type.toBe<Object>()
expect(extendExtendedSchema).type.toHaveProperty('extend')

const rawNullableSchema = S.object()
  .raw({ nullable: true })
  .required(['foo', 'hello'])
  .prop('foo', S.string())
  .prop('hello', S.string())

expect(rawNullableSchema.valueOf()).type.toBe<Object>()
expect(rawNullableSchema).type.toHaveProperty('raw')
expect(rawNullableSchema).type.toHaveProperty('required')

const dependentRequired = S.object()
  .dependentRequired({
    foo: ['bar'],
  })
  .prop('foo')
  .prop('bar')

expect(dependentRequired.valueOf()).type.toBe<Object>()
expect(dependentRequired).type.toHaveProperty('dependentRequired')

const dependentSchemas = S.object()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))

expect(dependentSchemas.valueOf()).type.toBe<Object>()
expect(dependentSchemas).type.toHaveProperty('dependentSchemas')

const deprecatedSchema = S.object()
  .deprecated()
  .prop('foo', S.string().deprecated())

expect(deprecatedSchema.valueOf()).type.toBe<Object>()
expect(deprecatedSchema).type.toHaveProperty('deprecated')

type Foo = {
  foo: string
  bar: string
}

const dependentRequiredWithType = S.object<Foo>()
  .dependentRequired({
    foo: ['bar'],
  })
  .prop('foo')
  .prop('bar')

expect(dependentRequiredWithType.valueOf()).type.toBe<Object>()
expect(dependentRequiredWithType).type.toHaveProperty('dependentRequired')
expect(dependentRequiredWithType).type.toHaveProperty('prop')

const dependentSchemasWithType = S.object<Foo>()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))

expect(dependentSchemasWithType.valueOf()).type.toBe<Object>()
expect(dependentSchemasWithType).type.toHaveProperty('dependentSchemas')

const deprecatedSchemaWithType = S.object<Foo>()
  .deprecated()
  .prop('foo', S.string().deprecated())

expect(deprecatedSchemaWithType.valueOf()).type.toBe<Object>()
expect(deprecatedSchemaWithType).type.toHaveProperty('deprecated')

type ReallyLongType = {
  foo: string
  bar: string
  baz: string
  xpto: string
  abcd: number
  kct: {
    a: string
    b: number
    d: null
  }
}

const deepTestOnTypes = S.object<ReallyLongType>()
  .prop('bar', S.object().prop('bar'))
  // you can provide any string, to avoid breaking changes
  .prop('aaaa', S.anyOf([S.string()]))
  .definition('abcd', S.number())

expect(deepTestOnTypes.valueOf()).type.toBe<Object>()
expect(deepTestOnTypes).type.toHaveProperty('prop')
expect(deepTestOnTypes).type.toHaveProperty('definition')

const tsIsoSchema = S.object()
  .prop('createdAt', S.string().format('iso-time'))
  .prop('updatedAt', S.string().format('iso-date-time'))

expect(tsIsoSchema.valueOf()).type.toBe<Object>()
expect(tsIsoSchema).type.toHaveProperty('prop')
expect(S.string().format('iso-time')).type.toHaveProperty('format')
expect(S.string().format('iso-date-time')).type.toHaveProperty('format')
