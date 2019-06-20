# fluent-schema

A fluent API to generate JSON schemas (draft-07) for Node.js and browser.

[![view on npm](https://img.shields.io/npm/v/fluent-schema.svg)](https://www.npmjs.org/package/fluent-schema)
[![Build Status](https://travis-ci.com/fastify/fluent-schema.svg?branch=master)](https://travis-ci.com/fastify/fluent-schema?branch=master)

## Features

- Fluent schema implements JSON Schema draft-07 standards
- Faster and shorter way to write a JSON Schema via a [fluent API](https://en.wikipedia.org/wiki/Fluent_interface)
- Runtime errors for invalid options or keywords misuse
- Javascript constants can be used in the JSON schema (e.g. _enum_, _const_, _default_ ) avoiding discrepancies between model and schema
- Typescript definitions
- Zero dependencies
- Coverage 99%

## Install

    npm install fluent-schema --save

or

    yarn add fluent-schema

## Usage

```javascript
const S = require('fluent-schema')

const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

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
  .prop(
    'role',
    S.string()
      .enum(Object.values(ROLES))
      .default(ROLES.USER)
  )
  .definition(
    'address',
    S.object()
      .id('#address')
      .prop('line1', S.string())
      .prop('line2', S.string())
      .prop('country', S.string())
      .prop('city', S.string())
      .prop('zipcode', S.string())
      .required(['line1', 'country', 'city', 'zipcode'])
  )
  .prop('address', S.ref('#address'))

console.log(JSON.stringify(schema.valueOf(), undefined, 2))
```

Schema generated:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "address": {
      "type": "object",
      "$id": "#address",
      "properties": {
        "line1": {
          "type": "string"
        },
        "line2": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "zipcode": {
          "type": "string"
        }
      },
      "required": ["line1", "country", "city", "zipcode"]
    }
  },
  "type": "object",
  "$id": "http://foo/user",
  "title": "My First Fluent JSON Schema",
  "description": "A simple user",
  "properties": {
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "role": {
      "enum": ["ADMIN", "USER"],
      "default": "USER",
      "type": "string"
    },
    "address": {
      "$ref": "#address"
    }
  },
  "required": ["email", "password"]
}
```

## Typescript

with `"esModuleInterop": true` activated in the `tsconfig.json`

```typescript
import S from 'fluent-schema'

const schema = S.object()
  .prop('foo', S.string())
  .prop('bar', S.number())
  .valueOf()
```

with `"esModuleInterop": false` in the `tsconfig.json`

```typescript
import * as S from 'fluent-schema'

const schema = S.object()
  .prop('foo', S.string())
  .prop('bar', S.number())
  .valueOf()
```

## Validation

Fluent schema **doesn't** validate a JSON schema. However there are many libraries that can do that for you.
Below a few examples using [AJV](https://ajv.js.org/)

    npm install ajv --save

or

    yarn add ajv

### Validate an empty model

Snippet

```javascript
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(schema.valueOf())
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

### Detect Fluent Schema objects
Every Fluent Schema objects contains a symbol that you can access with `Symbol.for('fluent-schema-object')`. In this way you can write your own utilities that understands the Fluent Schema API and improve the user experience of your tool.

```js
const S = require('fluent-schema')

const schema = S.object()
  .prop('foo', S.string())
  .prop('bar', S.number())
console.log(schema[Symbol.for('fluent-schema-object')]) // true
```

## Documentation

[API Doc](./docs/API.md).
[JSON schema reference](https://json-schema.org/latest/json-schema-validation.html):

## Acknowledgments

Thanks to [Matteo Collina](https://twitter.com/matteocollina) for pushing me to implement this utility! 🙏

## Related projects

- JSON Schema [Draft 7](http://json-schema.org/specification-links.html#draft-7)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/) (despite is referring to draft 6 the guide still good to grasp the main concepts)
- [AJV]() JSON Schema validator
- [jsonschema.net](https://www.jsonschema.net/) an online JSON Schema visual editor (it doesn't support advance features)

## Licence

Licensed under [MIT](./LICENSE).
