import { expect } from 'tstyche'

import S, { FluentSchemaError } from '..'

// isFluentJSONSchema and isFluentSchema properties
expect(S.object().isFluentJSONSchema).type.toEqual<boolean>()
expect(S.object().isFluentSchema).type.toEqual<boolean>()

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
  .valueOf()

const userBaseSchema = S.object()
  .additionalProperties(false)
  .prop('username', S.string())
  .prop('password', S.string())

const userSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))
  .extend(userBaseSchema)

const largeUserSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('username', S.string())
  .prop('password', S.string())
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const userSubsetSchema = largeUserSchema.only(['username', 'password'])

const personSchema = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const bodySchema = personSchema.without(['createdAt', 'updatedAt'])

const personSchemaAllowsUnix = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.mixed(['string', 'integer']).format('time'))
  .prop('updatedAt', S.mixed(['string', 'integer']).minimum(0))

try {
  S.object().prop('foo', 'boom!' as any)
} catch (e) {
  if (e instanceof FluentSchemaError) {
    expect(e).type.toEqual<FluentSchemaError>()
  }
}

const arrayExtendedSchema = S.array().items(userSchema).valueOf()

const extendExtendedSchema = S.object().extend(userSchema)

const rawNullableSchema = S.object()
  .raw({ nullable: true })
  .required(['foo', 'hello'])
  .prop('foo', S.string())
  .prop('hello', S.string())

const dependentRequired = S.object()
  .dependentRequired({
    foo: ['bar'],
  })
  .prop('foo')
  .prop('bar')
  .valueOf()

const dependentSchemas = S.object()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))
  .valueOf()

const deprecatedSchema = S.object()
  .deprecated()
  .prop('foo', S.string().deprecated())
  .valueOf()

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
  .valueOf()

const dependentSchemasWithType = S.object<Foo>()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))
  .valueOf()

const deprecatedSchemaWithType = S.object<Foo>()
  .deprecated()
  .prop('foo', S.string().deprecated())
  .valueOf()

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
  .valueOf()

const tsIsoSchema = S.object()
  .prop('createdAt', S.string().format('iso-time'))
  .prop('updatedAt', S.string().format('iso-date-time'))
  .valueOf()
