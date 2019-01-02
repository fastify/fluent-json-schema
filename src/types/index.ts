// This file will be passed to the TypeScript CLI to verify our typings compile

import { FluentSchema } from '../FluentSchema'
const schema = FluentSchema()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    FluentSchema()
      .id('#address')
      .prop('country')
      .allOf([FluentSchema().asString()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username')
  .prop(
    'avatar',
    FluentSchema()
      .asString()
      .contentEncoding('base64')
      .contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    FluentSchema()
      .asString()
      .default('123456')
      .minLength(6)
      .maxLength(12)
      .pattern('.*')
  )
  .required()
  .prop(
    'addresses',
    FluentSchema()
      .asArray()
      .items([FluentSchema().ref('#address')])
  )

  .required()
  .prop(
    'role',
    FluentSchema()
      .id('http://foo.com/role')
      .prop('name')
      .enum(['ADMIN', 'USER'])
      .prop('permissions')
  )
  .required()
  .prop('age', FluentSchema().asInteger())

  .valueOf()

console.log({ schema })
