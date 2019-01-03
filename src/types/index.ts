// This file will be passed to the TypeScript CLI to verify our typings compile

import { FluentSchema } from '../FluentSchema'
const schema = FluentSchema()
  .object()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    FluentSchema()
      .object()
      .id('#address')
      .prop('country')
      .allOf([FluentSchema().string()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username')
  .prop(
    'avatar',
    FluentSchema()
      .string()
      .contentEncoding('base64')
      .contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    FluentSchema()
      .string()
      .default('123456')
      .minLength(6)
      .maxLength(12)
      .pattern('.*')
  )
  .required()
  .prop(
    'addresses',
    FluentSchema()
      .array()
      .items([FluentSchema().ref('#address')])
  )
  .required()
  .prop(
    'role',
    FluentSchema()
      .object()
      .id('http://foo.com/role')
      .prop('name')
      .enum(['ADMIN', 'USER'])
      .prop('permissions')
  )
  .required()
  .prop('age', FluentSchema().integer())

  .valueOf()

console.log({ schema })
