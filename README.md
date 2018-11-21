# fluent-schema

A fluent API to generate JSON schemas (draft-07) for Node.js and browser.

## Install

    npm install fluent-schema --save

or

    yarn add fluent-schema

## Usage

```javascript
const schema = FluentSchema()
  .id('http://foo/user')
  .title('My First Fluent JSON Schema')
  .description('A simple user')
  .prop(
    'email',
    FluentSchema()
      .asString()
      .format(FORMATS.EMAIL)
  )
  .required()
  .prop(
    'password',
    FluentSchema()
      .asString()
      .minLength(8)
  )
  .required()
  .prop(
    'role',
    FluentSchema()
      .enum(['ADMIN', 'USER'])
      .default('USER')
  )
  .definition(
    'address',
    FluentSchema()
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
  .ref('#definitions/address')

console.log(JSON.stringify(schema.valueOf(), undefined, 2))
```

Schema generated:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "address": {
      "type": "object",
      "$id": "#definitions/address",
      "required": ["line1", "country", "city", "zipcode"],
      "properties": {
        "line1": {
          "type": "string",
          "$id": "#definitions/address/properties/line1"
        },
        "line2": {
          "type": "string",
          "$id": "#definitions/address/properties/line2"
        },
        "country": {
          "type": "string",
          "$id": "#definitions/address/properties/country"
        },
        "city": {
          "type": "string",
          "$id": "#definitions/address/properties/city"
        },
        "zipcode": {
          "type": "string",
          "$id": "#definitions/address/properties/zipcode"
        }
      }
    }
  },
  "type": "object",
  "$id": "http://foo/user",
  "title": "My First Fluent JSON Schema",
  "description": "A simple user",
  "properties": {
    "email": {
      "type": "string",
      "$id": "#properties/email",
      "format": "email"
    },
    "password": {
      "type": "string",
      "$id": "#properties/password",
      "minLength": 8
    },
    "role": {
      "type": "object",
      "default": "USER",
      "$id": "#properties/role",
      "enum": ["ADMIN", "USER"]
    },
    "address": {
      "$ref": "#definitions/address"
    }
  },
  "required": ["email", "password"]
}
```

## Features

- Fluent schema implements JSON Schema draft-07 standards
- Faster and shorter way to write a JSON Schema via a [fluent API](https://en.wikipedia.org/wiki/Fluent_interface)
- Runtime errors for invalid options or keywords misuse
- Javascript constants can be used in the JSON schema (e.g. _enum_, _const_, _default_ ) avoiding discrepancies between model and schema
- Flexible API to write inline or nested props

## Integration

Fluent schema **doesn't** validate a JSON schema. However there are many libraries that can do that for you.
Below a few examples using [AJV](https://ajv.js.org/)

    npm install ajv --save

or

    yarn add ajv

### Validate an empty model

Snippet

```javascript
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(userSchema.valueOf())
let user = {}
let valid = validate(user)
console.log({ valid }) //=> {valid: false}
console.log(validate.errors) //=> {valid: false}
```

Output:

```
{valid: false}
errors: [
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
]

```

### Validate a partially filled model

Snippet

```javascript
user = { email: 'test', password: 'password' }
valid = validate(user)
console.log({ valid })
console.log(validate.errors)
```

Output:

```
{valid: false}
errors:
[ { keyword: 'format',
    dataPath: '.email',
    schemaPath: '#/properties/email/format',
    params: { format: 'email' },
    message: 'should match format "email"' } ]

```

### Validate a model with a wrong format attribute

Snippet

```javascript
user = { email: 'test@foo.com', password: 'password' }
valid = validate(user)
console.log({ valid })
console.log('errors:', validate.errors)
```

Output:

```
{valid: false}
errors: [ { keyword: 'required',
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
```

### Valid model

Snippet

```javascript
user = { email: 'test@foo.com', password: 'password' }
valid = validate(user)
console.log({ valid })
```

Output:

     {valid: true}

## Validation Keywords Supported

[Reference](https://json-schema.org/latest/json-schema-validation.html):

1. Validation Keywords for Any Instance Type

- [x] types
  - [x] string
  - [x] boolean
  - [x] number
  - [x] integer
  - [x] array
  - [x] object
  - [x] null
- [x] enum
- [x] const

2. Validation Keywords for Numeric Instances (number and integer)

- [x] multipleOf
- [x] maximum
- [x] exclusiveMaximum
- [x] minimum
- [x] exclusiveMinimum

3. Validation Keywords for Strings

- [x] maxLength
- [x] minLength
- [x] pattern
- [x] format

4. Validation Keywords for Arrays

- [x] items
- [x] additionalItems
- [x] maxItems
- [x] minItems
- [x] uniqueItems
- [x] contains

5. Validation Keywords for Objects

- [x] maxProperties
- [x] minProperties
- [x] required
- [x] properties
- [x] patternProperties
- [x] additionalProperties
- [x] dependencies
- [x] propertyNames

6. Keywords for Applying Subschemas Conditionally

- [x] if
- [x] then
- [x] else

7. Keywords for Applying Subschemas With Boolean Logic

- [x] allOf
- [x] anyOf
- [x] oneOf
- [x] not

## Acknowledgments

Thanks to [Matteo Collina](https://twitter.com/matteocollina) for pushing me to implement this utility! 🙏

## Related projects

- JSON Schema [Draft 7](http://json-schema.org/specification-links.html#draft-7)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/) (despite is referring to draft 6 the guide still good to grasp the main concepts)
- [AJV]() JSON Schema validator
- [jsonschema.net](https://www.jsonschema.net/) an online JSON Schema visual editor (it doesn't support advance features)

## Licence

Licensed under [MIT](./LICENSE).
