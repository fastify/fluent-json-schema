// This file will be passed to the TypeScript CLI to verify our typings compile
const S = require('../FluentJSONSchema').default

console.log('isFluentSchema:', S.object().isFluentSchema)
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
  .prop(
    'avatar',
    S.string()
      .contentEncoding('base64')
      .contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    S.string()
      .default('123456')
      .minLength(6)
      .maxLength(12)
      .pattern('.*')
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
  .valueOf()

console.log('user:\n', JSON.stringify(userSchema))
