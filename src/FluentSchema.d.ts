export interface BaseSchema<T> {
  id: (id: string) => T
  title: (title: string) => T
  description: (description: string) => T
  examples: (examples: Array<any>) => T
  ref: (ref: string) => T
  enum: (values: Array<any>) => T
  const: (value: any) => T
  default: (value: any) => T
  required: (fields?: string[]) => T
  ifThen: (ifClause: JSONSchema, thenClause: JSONSchema) => T
  ifThenElse: (
    ifClause: JSONSchema,
    thenClause: JSONSchema,
    elseClause: JSONSchema
  ) => T
  not: (schema: JSONSchema) => T
  anyOf: (schema: Array<JSONSchema>) => T
  allOf: (schema: Array<JSONSchema>) => T
  oneOf: (schema: Array<JSONSchema>) => T
  readOnly: (isReadOnly?: boolean) => T
  writeOnly: (isWriteOnly?: boolean) => T
  isFluentSchema: boolean
  raw: (fragment: any) => JSONSchema
}

export type TYPE =
  | 'string'
  | 'number'
  | 'boolean'
  | 'integer'
  | 'object'
  | 'array'
  | 'null'

type FORMATS = {
  RELATIVE_JSON_POINTER: 'relative-json-pointer'
  JSON_POINTER: 'json-pointer'
  UUID: 'uuid'
  REGEX: 'regex'
  IPV6: 'ipv6'
  IPV4: 'ipv4'
  HOSTNAME: 'hostname'
  EMAIL: 'email'
  URL: 'url'
  URI_TEMPLATE: 'uri-template'
  URI_REFERENCE: 'uri-reference'
  URI: 'uri'
  TIME: 'time'
  DATE: 'date'
  DATE_TIME: 'date-time'
}

export type JSONSchema =
  | ObjectSchema
  | StringSchema
  | NumberSchema
  | ArraySchema
  | IntegerSchema
  | BooleanSchema
  | NullSchema

export class FluentSchemaError extends Error {
  name: string
}

export interface SchemaOptions {
  schema: object
  generateIds: boolean
}

export interface StringSchema extends BaseSchema<StringSchema> {
  minLength: (min: number) => StringSchema
  maxLength: (min: number) => StringSchema
  format: (format: FORMATS[keyof FORMATS]) => StringSchema
  pattern: (pattern: string | RegExp) => StringSchema
  contentEncoding: (encoding: string) => StringSchema
  contentMediaType: (mediaType: string) => StringSchema
}

export interface NullSchema {
  null: () => StringSchema
}

export interface BooleanSchema extends BaseSchema<BooleanSchema> {
  boolean: () => BooleanSchema
}

export interface NumberSchema extends BaseSchema<NumberSchema> {
  minimum: (min: number) => NumberSchema
  exclusiveMinimum: (min: number) => NumberSchema
  maximum: (max: number) => NumberSchema
  exclusiveMaximum: (max: number) => NumberSchema
  multipleOf: (multiple: number) => NumberSchema
}

export interface IntegerSchema extends BaseSchema<IntegerSchema> {
  minimum: (min: number) => IntegerSchema
  exclusiveMinimum: (min: number) => IntegerSchema
  maximum: (max: number) => IntegerSchema
  exclusiveMaximum: (max: number) => IntegerSchema
  multipleOf: (multiple: number) => IntegerSchema
}

export interface ArraySchema extends BaseSchema<ArraySchema> {
  items: (items: JSONSchema | Array<JSONSchema>) => ArraySchema
  additionalItems: (items: Array<JSONSchema> | boolean) => ArraySchema
  contains: (value: JSONSchema | boolean) => ArraySchema
  uniqueItems: (boolean: boolean) => ArraySchema
  minItems: (min: number) => ArraySchema
  maxItems: (max: number) => ArraySchema
}

export interface ObjectSchema extends BaseSchema<ObjectSchema> {
  definition: (name: string, props?: JSONSchema) => ObjectSchema
  prop: (name: string, props?: JSONSchema) => ObjectSchema
  additionalProperties: (value: JSONSchema | boolean) => ObjectSchema
  maxProperties: (max: number) => ObjectSchema
  minProperties: (min: number) => ObjectSchema
  patternProperties: (options: PatternPropertiesOptions) => ObjectSchema
  dependencies: (options: DependenciesOptions) => ObjectSchema
  propertyNames: (value: JSONSchema) => ObjectSchema
  extend: (
    schema: ObjectSchema
  ) => Pick<ObjectSchema, 'isFluentSchema' | 'extend'>
}

export interface MixedSchema<T> extends BaseSchema<T> {
  // [any]: () => any
  //FIXME LS it should implement all the methods from the generics*/
  // maxLength(max:number):T
  // minimum(min:number):T
}

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
export function withOptions<T>(options: SchemaOptions): T

export interface S extends BaseSchema<S> {
  string: () => StringSchema
  number: () => NumberSchema
  integer: () => IntegerSchema
  boolean: () => BooleanSchema
  array: () => ArraySchema
  object: () => ObjectSchema
  null: () => NullSchema
  //FIXME LS we should return only a MixedSchema
  mixed: <T>(types: TYPE[]) => MixedSchema<T> & any
  raw: (fragment: any) => JSONSchema
  FORMATS: FORMATS
}

declare var s: S
export default s
