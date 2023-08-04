declare namespace fluentSchema {
  export type TYPE =
    | "string"
    | "number"
    | "boolean"
    | "integer"
    | "object"
    | "array"
    | "null";

  type FORMATS = {
    RELATIVE_JSON_POINTER: "relative-json-pointer";
    JSON_POINTER: "json-pointer";
    UUID: "uuid";
    REGEX: "regex";
    IPV6: "ipv6";
    IPV4: "ipv4";
    HOSTNAME: "hostname";
    EMAIL: "email";
    URL: "url";
    URI_TEMPLATE: "uri-template";
    URI_REFERENCE: "uri-reference";
    URI: "uri";
    TIME: "time";
    DATE: "date";
    DATE_TIME: "date-time";
  };

  type InferSchemaMap = {
    string: fluentSchema.StringSchema;
    number: fluentSchema.NumberSchema;
    boolean: fluentSchema.BooleanSchema;
    integer: fluentSchema.IntegerSchema;
    object: fluentSchema.ObjectSchema;
    array: fluentSchema.ArraySchema;
    null: fluentSchema.NullSchema;
  };

  type MixedSchema1<T> = T extends [infer U]
    ? InferSchemaMap[U extends TYPE ? U : never]
    : never;
  type MixedSchema2<T> = T extends [infer U, infer V]
    ? InferSchemaMap[U extends TYPE ? U : never] &
    InferSchemaMap[V extends TYPE ? V : never]
    : never;
  type MixedSchema3<T> = T extends [infer U, infer V, infer W]
    ? InferSchemaMap[U extends TYPE ? U : never] &
    InferSchemaMap[V extends TYPE ? V : never] &
    InferSchemaMap[W extends TYPE ? W : never]
    : never;
  type MixedSchema4<T> = T extends [infer U, infer V, infer W, infer X]
    ? InferSchemaMap[U extends TYPE ? U : never] &
    InferSchemaMap[V extends TYPE ? V : never] &
    InferSchemaMap[W extends TYPE ? W : never] &
    InferSchemaMap[X extends TYPE ? X : never]
    : never;
  type MixedSchema5<T> = T extends [infer U, infer V, infer W, infer X, infer Y]
    ? InferSchemaMap[U extends TYPE ? U : never] &
    InferSchemaMap[V extends TYPE ? V : never] &
    InferSchemaMap[W extends TYPE ? W : never] &
    InferSchemaMap[X extends TYPE ? X : never] &
    InferSchemaMap[Y extends TYPE ? Y : never]
    : never;
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
    : never;
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
    : never;

  export type MixedSchema<T> =
    | MixedSchema1<T>
    | MixedSchema2<T>
    | MixedSchema3<T>
    | MixedSchema4<T>
    | MixedSchema5<T>
    | MixedSchema6<T>
    | MixedSchema7<T>;

  type Key<T> = keyof T | (string & {});

  type DependentSchemaOptions<T extends Partial<Record<string, fluentSchema.JSONSchema>>> =
    Partial<Record<keyof T, fluentSchema.JSONSchema>>;

  type DependentRequiredOptions<T extends Partial<Record<string, string[]>>> =
    Partial<Record<keyof T, string[]>>;

  type ObjectPlaceholder = Record<string | number | symbol, any>;

  export class FluentSchemaError extends Error {
    name: string;
  }

  export type JSONSchema =
    | ObjectSchema
    | StringSchema
    | NumberSchema
    | ArraySchema
    | IntegerSchema
    | BooleanSchema
    | NullSchema
    | ExtendedSchema;

  export interface BaseSchema<T> {
    id: (id: string) => T;
    title: (title: string) => T;
    description: (description: string) => T;
    examples: (examples: Array<any>) => T;
    ref: (ref: string) => T;
    enum: (values: Array<any>) => T;
    const: (value: any) => T;
    default: (value: any) => T;
    required: (fields?: string[]) => T;
    ifThen: (ifClause: JSONSchema, thenClause: JSONSchema) => T;
    ifThenElse: (
      ifClause: JSONSchema,
      thenClause: JSONSchema,
      elseClause: JSONSchema
    ) => T;
    not: (schema: JSONSchema) => T;
    anyOf: (schema: Array<JSONSchema>) => T;
    allOf: (schema: Array<JSONSchema>) => T;
    oneOf: (schema: Array<JSONSchema>) => T;
    readOnly: (isReadOnly?: boolean) => T;
    writeOnly: (isWriteOnly?: boolean) => T;
    deprecated: (isDeprecated?: boolean) => T;
    isFluentSchema: boolean;
    isFluentJSONSchema: boolean;
    raw: (fragment: any) => T;
  }

  export interface SchemaOptions {
    schema: object;
    generateIds: boolean;
  }

  export interface PatternPropertiesOptions {
    [key: string]: JSONSchema;
  }

  export interface DependenciesOptions {
    [key: string]: JSONSchema[];
  }


  export interface SchemaOptions {
    schema: object;
    generateIds: boolean;
  }

  export interface StringSchema extends fluentSchema.BaseSchema<StringSchema> {
    minLength: (min: number) => StringSchema;
    maxLength: (min: number) => StringSchema;
    format: (format: FORMATS[keyof FORMATS]) => StringSchema;
    pattern: (pattern: string | RegExp) => StringSchema;
    contentEncoding: (encoding: string) => StringSchema;
    contentMediaType: (mediaType: string) => StringSchema;
  }

  export interface NullSchema {
    null: () => StringSchema;
  }

  export interface BooleanSchema extends fluentSchema.BaseSchema<BooleanSchema> {
    boolean: () => BooleanSchema;
  }

  export interface NumberSchema extends fluentSchema.BaseSchema<NumberSchema> {
    minimum: (min: number) => NumberSchema;
    exclusiveMinimum: (min: number) => NumberSchema;
    maximum: (max: number) => NumberSchema;
    exclusiveMaximum: (max: number) => NumberSchema;
    multipleOf: (multiple: number) => NumberSchema;
  }

  export interface IntegerSchema extends fluentSchema.BaseSchema<IntegerSchema> {
    minimum: (min: number) => IntegerSchema;
    exclusiveMinimum: (min: number) => IntegerSchema;
    maximum: (max: number) => IntegerSchema;
    exclusiveMaximum: (max: number) => IntegerSchema;
    multipleOf: (multiple: number) => IntegerSchema;
  }

  export interface ArraySchema extends fluentSchema.BaseSchema<ArraySchema> {
    items: (items: JSONSchema | Array<JSONSchema>) => ArraySchema;
    additionalItems: (items: Array<JSONSchema> | boolean) => ArraySchema;
    contains: (value: JSONSchema | boolean) => ArraySchema;
    uniqueItems: (boolean: boolean) => ArraySchema;
    minItems: (min: number) => ArraySchema;
    maxItems: (max: number) => ArraySchema;
  }

  export interface ObjectSchema<T extends Record<string, any> = Record<string, any>>
    extends fluentSchema.BaseSchema<ObjectSchema<T>> {
    definition: (name: Key<T>, props?: JSONSchema) => ObjectSchema<T>;
    prop: (name: Key<T>, props?: JSONSchema) => ObjectSchema<T>;
    additionalProperties: (value: JSONSchema | boolean) => ObjectSchema<T>;
    maxProperties: (max: number) => ObjectSchema<T>;
    minProperties: (min: number) => ObjectSchema<T>;
    patternProperties: (options: PatternPropertiesOptions) => ObjectSchema<T>;
    dependencies: (options: DependenciesOptions) => ObjectSchema<T>;
    propertyNames: (value: JSONSchema) => ObjectSchema<T>;
    extend: (schema: ObjectSchema<T> | ExtendedSchema) => ExtendedSchema;
    only: (properties: string[]) => ObjectSchema<T>;
    without: (properties: string[]) => ObjectSchema<T>;
    dependentRequired: (options: DependentRequiredOptions<T>) => ObjectSchema<T>;
    dependentSchemas: (options: DependentSchemaOptions<T>) => ObjectSchema<T>;
  }

  export interface S extends BaseSchema<S> {
    string: () => StringSchema;
    number: () => NumberSchema;
    integer: () => IntegerSchema;
    boolean: () => BooleanSchema;
    array: () => ArraySchema;
    object: <
      T extends ObjectPlaceholder = ObjectPlaceholder
    >() => ObjectSchema<T>;
    null: () => NullSchema;
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
    ) => MixedSchema<T>;
    raw: (fragment: any) => S;
    FORMATS: FORMATS;
  }

  export type ExtendedSchema = Pick<ObjectSchema, "isFluentSchema" | "extend">;

  export function withOptions<T>(options: SchemaOptions): T;

  const FluentSchema: S;
  export { FluentSchema as default };
}

export = fluentSchema;
