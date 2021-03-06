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
  isFluentJSONSchema: boolean
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

export interface ObjectSchema extends BaseSchema<ObjectSchema> {
  definition: (name: string, props?: JSONSchema) => ObjectSchema
  prop: (name: string, props?: JSONSchema) => ObjectSchema
  additionalProperties: (value: JSONSchema | boolean) => ObjectSchema
  maxProperties: (max: number) => ObjectSchema
  minProperties: (min: number) => ObjectSchema
  patternProperties: (options: PatternPropertiesOptions) => ObjectSchema
  dependencies: (options: DependenciesOptions) => ObjectSchema
  propertyNames: (value: JSONSchema) => ObjectSchema
  extend: (schema: ObjectSchema | ExtendedSchema) => ExtendedSchema
  only: (properties: string[]) => ObjectSchema
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

type MixedSchema1<T> = T extends [infer U]
  ? InferSchemaMap[U extends TYPE ? U : never]
  : never
type MixedSchema2<T> = T extends [infer U, infer V]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never]
  : never
type MixedSchema3<T> = T extends [infer U, infer V, infer W]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never] &
      InferSchemaMap[W extends TYPE ? W : never]
  : never
type MixedSchema4<T> = T extends [infer U, infer V, infer W, infer X]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never] &
      InferSchemaMap[W extends TYPE ? W : never] &
      InferSchemaMap[X extends TYPE ? X : never]
  : never
type MixedSchema5<T> = T extends [infer U, infer V, infer W, infer X, infer Y]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never] &
      InferSchemaMap[W extends TYPE ? W : never] &
      InferSchemaMap[X extends TYPE ? X : never] &
      InferSchemaMap[Y extends TYPE ? Y : never]
  : never
type MixedSchema6<T> = T extends [
  infer U,
  infer V,
  infer W,
  infer X,
  infer Y,
  infer Z
]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never] &
      InferSchemaMap[W extends TYPE ? W : never] &
      InferSchemaMap[X extends TYPE ? X : never] &
      InferSchemaMap[Y extends TYPE ? Y : never] &
      InferSchemaMap[Z extends TYPE ? Z : never]
  : never
type MixedSchema7<T> = T extends [
  infer U,
  infer V,
  infer W,
  infer X,
  infer Y,
  infer Z,
  infer A
]
  ? InferSchemaMap[U extends TYPE ? U : never] &
      InferSchemaMap[V extends TYPE ? V : never] &
      InferSchemaMap[W extends TYPE ? W : never] &
      InferSchemaMap[X extends TYPE ? X : never] &
      InferSchemaMap[Y extends TYPE ? Y : never] &
      InferSchemaMap[Z extends TYPE ? Z : never] &
      InferSchemaMap[A extends TYPE ? A : never]
  : never

export type MixedSchema<T> =
  | MixedSchema1<T>
  | MixedSchema2<T>
  | MixedSchema3<T>
  | MixedSchema4<T>
  | MixedSchema5<T>
  | MixedSchema6<T>
  | MixedSchema7<T>

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
  mixed: <
    T extends
      | [TYPE]
      | [TYPE, TYPE]
      | [TYPE, TYPE, TYPE]
      | [TYPE, TYPE, TYPE, TYPE]
      | [TYPE, TYPE, TYPE, TYPE, TYPE]
      | [TYPE, TYPE, TYPE, TYPE, TYPE, TYPE]
      | [TYPE, TYPE, TYPE, TYPE, TYPE, TYPE, TYPE]
  >(
    types: T
  ) => MixedSchema<T>
  raw: (fragment: any) => JSONSchema
  FORMATS: FORMATS
}

declare var s: S
export default s
