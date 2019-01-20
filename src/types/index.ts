// This file will be passed to the TypeScript CLI to verify our typings compile

import S, { StringSchema, NumberSchema, ArraySchema } from '../FluentSchema'
const mixed = S.mixed<NumberSchema, StringSchema, ArraySchema>([
  'string',
  'number',
])
mixed.maxLength(1).minimum(5)

const schema = S.object()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    S.object()
      .id('#address')
      .prop('country')
      .allOf([S.string()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username')
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
  .prop('age', S.integer())

  .valueOf()

console.log({ schema })
