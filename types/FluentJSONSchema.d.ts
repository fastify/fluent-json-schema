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
  deprecated: (isDeprecated?: boolean) => T
  isFluentSchema: boolean
  isFluentJSONSchema: boolean
  raw: (fragment: any) => T
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
  | ExtendedSchema

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

export interface ObjectSchema<T extends Record<string, any> = Record<string, any>> extends BaseSchema<ObjectSchema<T>> {
  definition: (name: Key<T>, props?: JSONSchema) => ObjectSchema<T>
  prop: (name: Key<T>, props?: JSONSchema) => ObjectSchema<T>
  additionalProperties: (value: JSONSchema | boolean) => ObjectSchema<T>
  maxProperties: (max: number) => ObjectSchema<T>
  minProperties: (min: number) => ObjectSchema<T>
  patternProperties: (options: PatternPropertiesOptions) => ObjectSchema<T>
  dependencies: (options: DependenciesOptions) => ObjectSchema<T>
  propertyNames: (value: JSONSchema) => ObjectSchema<T>
  extend: (schema: ObjectSchema<T> | ExtendedSchema) => ExtendedSchema
  only: (properties: string[]) => ObjectSchema<T>
  without: (properties: string[]) => ObjectSchema<T>
  dependentRequired: (options: DependentRequiredOptions<T>) => ObjectSchema<T>
  dependentSchemas: (options: DependentSchemaOptions<T>) => ObjectSchema<T>
}

export type ExtendedSchema = Pick<ObjectSchema, 'isFluentSchema' | 'extend'>

type InferSchemaMap = {
  string: StringSchema
  number: NumberSchema
  boolean: BooleanSchema
  integer: IntegerSchema
  object: ObjectSchema
  array: ArraySchema
  null: NullSchema
}

export type MixedSchema<T extends TYPE[]> =
  T extends readonly [infer First extends TYPE, ...infer Rest extends TYPE[]]
    ? InferSchemaMap[First] & MixedSchema<Rest>
    : unknown


interface PatternPropertiesOptions {
  [key: string]: JSONSchema
}

interface DependenciesOptions {
  [key: string]: JSONSchema[]
}

type Key<T> = keyof T | (string & {})

type DependentSchemaOptions<T extends Partial<Record<string, JSONSchema>>> = Partial<Record<keyof T, JSONSchema>>

type DependentRequiredOptions<T extends Partial<Record<string, string[]>>> = Partial<Record<keyof T, string[]>>

export function withOptions<T>(options: SchemaOptions): T

type ObjectPlaceholder = Record<string | number | symbol, any>;

export interface S extends BaseSchema<S> {
  string: () => StringSchema
  number: () => NumberSchema
  integer: () => IntegerSchema
  boolean: () => BooleanSchema
  array: () => ArraySchema
  object: <T extends ObjectPlaceholder = ObjectPlaceholder>() => ObjectSchema<T>
  null: () => NullSchema
  mixed<T extends [TYPE, ...TYPE[]]>(types: T): MixedSchema<T>
  raw: (fragment: any) => S
  FORMATS: FORMATS
}

export declare var S: S

export default S
