'use strict'
const S = require('./FluentSchema')
const Ajv = require('ajv')

const schema = S.object()
  .id('http://foo/user')
  .title('My First Fluent JSON Schema')
  .description('A simple user')
  .prop(
    'email',
    S.string()
      .format(S.FORMATS.EMAIL)
      .required()
  )
  .prop(
    'password',
    S.string()
      .minLength(8)
      .required()
  )
  .prop('role', S.enum(['ADMIN', 'USER']).default('USER'))
  .definition(
    'address',
    S.object()
      .id('#address')
      .prop('line1')
      .required()
      .prop('line2')
      .prop('country')
      .required()
      .prop('city')
      .required()
      .prop('zipcode')
      .required()
  )
  .prop('address')
  .ref('#address')

console.log(JSON.stringify(schema.valueOf(), undefined, 2))

const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(schema.valueOf())
let user = {}
let valid = validate(user)
console.log({ valid }) //=> {valid: false}
console.log(validate.errors)
/* [
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'email' },
    message: "should have required property 'email'",
  },
  {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'password' },
    message: "should have required property 'password'",
  },
]*/

user = { email: 'test', password: 'password' }
valid = validate(user)
console.log({ valid }) //=> {valid: false}
console.log(validate.errors)
/*
[ { keyword: 'format',
    dataPath: '.email',
    schemaPath: '#/properties/email/format',
    params: { format: 'email' },
    message: 'should match format "email"' } ]
*/

user = { email: 'test@foo.com', password: 'password' }
valid = validate(user)
console.log({ valid }) //=> {valid: true}
console.log(validate.errors) // => null

user = { email: 'test@foo.com', password: 'password', address: { line1: '' } }
valid = validate(user)
console.log({ valid }) //=> {valid: false}
console.log(validate.errors)

/*
{ valid: false }
[ { keyword: 'required',
    dataPath: '.address',
    schemaPath: '#definitions/address/required',
    params: { missingProperty: 'country' },
    message: 'should have required property \'country\'' },
  { keyword: 'required',
    dataPath: '.address',
    schemaPath: '#definitions/address/required',
    params: { missingProperty: 'city' },
    message: 'should have required property \'city\'' },
  { keyword: 'required',
    dataPath: '.address',
    schemaPath: '#definitions/address/required',
    params: { missingProperty: 'zipcoce' },
    message: 'should have required property \'zipcode\'' } ]
*/
