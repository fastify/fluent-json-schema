'use strict'
// This file will be passed to the TypeScript CLI to verify our typings compile
Object.defineProperty(exports, '__esModule', { value: true })
const FluentSchema_1 = require('../FluentSchema')
const mixed = FluentSchema_1.FluentSchema().mixed()
mixed.maxLength(1).minimum(3)
const schema = FluentSchema_1.FluentSchema()
  .object()
  .id('http://foo.com/user')
  .title('A User')
  .description('A User desc')
  .definition(
    'address',
    FluentSchema_1.FluentSchema()
      .object()
      .id('#address')
      .prop('country')
      .allOf([FluentSchema_1.FluentSchema().string()])
      .prop('city')
      .prop('zipcode')
  )
  .prop('username')
  .prop(
    'avatar',
    FluentSchema_1.FluentSchema()
      .string()
      .contentEncoding('base64')
      .contentMediaType('image/png')
  )
  .required()
  .prop(
    'password',
    FluentSchema_1.FluentSchema()
      .string()
      .default('123456')
      .minLength(6)
      .maxLength(12)
      .pattern('.*')
  )
  .required()
  .prop(
    'addresses',
    FluentSchema_1.FluentSchema()
      .array()
      .items([FluentSchema_1.FluentSchema().ref('#address')])
  )
  .required()
  .prop(
    'role',
    FluentSchema_1.FluentSchema()
      .object()
      .id('http://foo.com/role')
      .prop('name')
      .enum(['ADMIN', 'USER'])
      .prop('permissions')
  )
  .required()
  .prop('age', FluentSchema_1.FluentSchema().integer())
  .valueOf()
console.log({ schema })
