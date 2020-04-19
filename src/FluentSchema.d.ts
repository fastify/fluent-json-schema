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

export type FORMATS =
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

export type JSONSchema =
  | ObjectSchema
  | StringSchema
  | NumberSchema
  | ArraySchema
  | IntegerSchema
  | BooleanSchema
  | NullSchema

export interface SchemaOptions {
  schema: object
  generateIds: boolean
}

export interface StringSchema extends BaseSchema<StringSchema> {
  minLength: (min: number) => StringSchema
  maxLength: (min: number) => StringSchema
  format: (format: FORMATS) => StringSchema
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
  extend: (schema: ObjectSchema) => ObjectSchema
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
}

declare var s: S
export default s
