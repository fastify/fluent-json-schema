import { StringSchema } from './FluentSchema'

declare namespace FluentSchema {
  function BaseSchema<T>(opt?: SchemaOptions): T

  interface SchemaOptions {
    schema: object
    generateIds: boolean
  }

  interface BaseSchema<T> {
    id: (id: string) => T
    title: (title: string) => T
    description: (description: string) => T
    examples: (examples: Array<any>) => T
    ref: (ref: string) => T
    enum: (values: Array<any>) => T
    const: (value: any) => T
    default: (value: any) => T
    required: () => T
    not: (schema: JSONSchema) => T
    anyOf: (schema: Array<JSONSchema>) => T
    allOf: (schema: Array<JSONSchema>) => T
    oneOf: (schema: Array<JSONSchema>) => T
  }

  type FORMATS =
    | 'relative-json-pointer'
    | 'json-pointer'
    | 'uuid'
    | 'regex'
    | 'ipv6'
    | 'ipv4'
    | 'hostname'
    | 'email'
    | 'url'
    | 'uri-template'
    | 'uri-reference'
    | 'uri'
    | 'time'
    | 'date'
    | 'date-time'

  type JSONSchema =
    | ObjectSchema
    | StringSchema
    | NumberSchema
    | ArraySchema
    | IntegerSchema
    | BooleanSchema

  interface SchemaOptions {
    schema: object
    generateIds: boolean
  }

  interface StringSchema extends BaseSchema<StringSchema> {
    minLength: (min: number) => StringSchema
    maxLength: (min: number) => StringSchema
    format: (format: FORMATS) => StringSchema
    pattern: (pattern: string) => StringSchema
    contentEncoding: (encoding: string) => StringSchema
    contentMediaType: (mediaType: string) => StringSchema
  }

  interface NullSchema {
    null: () => StringSchema
  }

  interface BooleanSchema extends BaseSchema<BooleanSchema> {
    boolean: () => BooleanSchema
  }

  interface NumberSchema extends BaseSchema<NumberSchema> {
    minimum: (min: number) => NumberSchema
    exclusiveMinimum: (min: number) => NumberSchema
    maximum: (max: number) => NumberSchema
    exclusiveMaximum: (max: number) => NumberSchema
    multipleOf: (multiple: number) => NumberSchema
  }

  interface IntegerSchema extends BaseSchema<IntegerSchema> {
    minimum: (min: number) => IntegerSchema
    exclusiveMinimum: (min: number) => IntegerSchema
    maximum: (max: number) => IntegerSchema
    exclusiveMaximum: (max: number) => IntegerSchema
    multipleOf: (multiple: number) => IntegerSchema
  }

  interface ArraySchema extends BaseSchema<ArraySchema> {
    items: (items: JSONSchema | Array<JSONSchema>) => ArraySchema
    additionalItems: (items: Array<JSONSchema> | boolean) => ArraySchema
    contains: (value: JSONSchema | boolean) => ArraySchema
    uniqueItems: (boolean: boolean) => ArraySchema
    minItems: (min: number) => ArraySchema
    maxItems: (min: number) => ArraySchema
  }

  interface ObjectSchema extends BaseSchema<ObjectSchema> {
    definition: (name: string, props?: JSONSchema) => ObjectSchema
    prop: (name: string, props?: JSONSchema) => ObjectSchema
    additionalProperties: (value: JSONSchema | boolean) => ObjectSchema
    maxProperties: (max: number) => ObjectSchema
    minProperties: (min: number) => ObjectSchema
    patternProperties: (options: PatternPropertiesOptions) => ObjectSchema
    dependencies: (options: DependenciesOptions) => ObjectSchema
    propertyNames: (value: JSONSchema) => ObjectSchema
  }

  function S(opt?: SchemaOptions): S

  interface SchemaOptions {
    schema: object
    generateIds: boolean
  }

  interface PatternPropertiesOptions {
    [key: string]: JSONSchema
  }

  interface DependenciesOptions {
    [key: string]: JSONSchema[]
  }

  interface S extends BaseSchema<S> {
    string: () => StringSchema
    number: () => NumberSchema
    integer: () => IntegerSchema
    boolean: () => BooleanSchema
    array: () => ArraySchema
    object: () => ObjectSchema
    null: () => NullSchema
    mixed: <T>(types: string[]) => T & any //FIXME LS it should always return T despite the method called
  }
}
export = FluentSchema
