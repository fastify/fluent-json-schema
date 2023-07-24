// This file will be passed to the TypeScript CLI to verify our typings compile

import S, { FluentSchemaError } from '..'

console.log('isFluentSchema:', S.object().isFluentJSONSchema)
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

console.log('example:\n', JSON.stringify(schema))
console.log('isFluentSchema:', S.object().isFluentSchema)

const userBaseSchema = S.object()
  .additionalProperties(false)
  .prop('username', S.string())
  .prop('password', S.string())

const userSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))
  .extend(userBaseSchema)

console.log('user:\n', JSON.stringify(userSchema.valueOf()))

const largeUserSchema = S.object()
  .prop('id', S.string().format('uuid'))
  .prop('username', S.string())
  .prop('password', S.string())
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const userSubsetSchema = largeUserSchema.only(['username', 'password'])

console.log('user subset:', JSON.stringify(userSubsetSchema.valueOf()))

const personSchema = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.string().format('time'))
  .prop('updatedAt', S.string().format('time'))

const bodySchema = personSchema.without(['createdAt', 'updatedAt'])

console.log('person subset:', JSON.stringify(bodySchema.valueOf()))

const personSchemaAllowsUnix = S.object()
  .prop('name', S.string())
  .prop('age', S.number())
  .prop('id', S.string().format('uuid'))
  .prop('createdAt', S.mixed(['string', 'integer']).format('time'))
  .prop('updatedAt', S.mixed(['string', 'integer']).minimum(0))

console.log('person schema allows unix:', JSON.stringify(personSchemaAllowsUnix.valueOf()))

try {
  S.object().prop('foo', 'boom!' as any)
} catch (e) {
  if (e instanceof FluentSchemaError) {
    console.log(e.message)
  }
}

const arrayExtendedSchema = S.array().items(userSchema).valueOf()

console.log('array of user\n', JSON.stringify(arrayExtendedSchema))

const extendExtendedSchema = S.object().extend(userSchema)

console.log('extend of user\n', JSON.stringify(extendExtendedSchema))

const rawNullableSchema = S.object()
  .raw({ nullable: true })
  .required(['foo', 'hello'])
  .prop('foo', S.string())
  .prop('hello', S.string())

console.log('raw schema with nullable props\n', JSON.stringify(rawNullableSchema))

const dependentRequired = S.object()
  .dependentRequired({
    foo: ['bar'],
  })
  .prop('foo')
  .prop('bar')
  .valueOf()

console.log('dependentRequired:\n', JSON.stringify(dependentRequired))

const dependentSchemas = S.object()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))
  .valueOf()

console.log('dependentRequired:\n', JSON.stringify(dependentSchemas))

const deprecatedSchema =  S.object()
    .deprecated()
    .prop('foo', S.string().deprecated())
    .valueOf()

console.log('deprecatedSchema:\n', JSON.stringify(deprecatedSchema))

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

console.log('dependentRequired:\n', JSON.stringify(dependentRequiredWithType))

const dependentSchemasWithType = S.object<Foo>()
  .dependentSchemas({
    foo: S.object().prop('bar'),
  })
  .prop('bar', S.object().prop('bar'))
  .valueOf()

console.log('dependentSchemasWithType:\n', JSON.stringify(dependentSchemasWithType))

const deprecatedSchemaWithType =  S.object<Foo>()
    .deprecated()
    .prop('foo', S.string().deprecated())
    .valueOf()

console.log('deprecatedSchemaWithType:\n', JSON.stringify(deprecatedSchemaWithType))

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

console.log('deepTestOnTypes:\n', JSON.stringify(deepTestOnTypes))
