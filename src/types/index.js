'use strict'
// This file will be passed to the TypeScript CLI to verify our typings compile
Object.defineProperty(exports, '__esModule', { value: true })
const FluentSchema_1 = require('../FluentSchema')
const mixed = FluentSchema_1.S.mixed(['string', 'number'])
mixed.minimum().maxLength()
const schema = FluentSchema_1.S.object()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    FluentSchema_1.S.object()
      .id('#address')
      .prop('country')
      .allOf([FluentSchema_1.S.string()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username')
  .prop(
    'avatar',
    FluentSchema_1.S.string()
      .contentEncoding('base64')
      .contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    FluentSchema_1.S.string()
      .default('123456')
      .minLength(6)
      .maxLength(12)
      .pattern('.*')
  )
  .required()
  .prop(
    'addresses',
    FluentSchema_1.S.array().items([FluentSchema_1.S.ref('#address')])
  )
  .required()
  .prop(
    'role',
    FluentSchema_1.S.object()
      .id('http://foo.com/role')
      .prop('name')
      .enum(['ADMIN', 'USER'])
      .prop('permissions')
  )
  .required()
  .prop('age', FluentSchema_1.S.integer())
  .valueOf()
console.log({ schema })
