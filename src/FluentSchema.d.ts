declare namespace FluentSchema {
  function FluentSchema(opt?: SchemaOptions): FluentSchema

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

  interface SchemaOptions {
    schema: object
    generateIds: boolean
  }

  interface PatternPropertiesOptions {
    [key: string]: FluentSchema
  }

  interface DependenciesOptions {
    [key: string]: FluentSchema[]
  }

  interface FluentSchema {
    id: (id: string) => FluentSchema
    title: (title: string) => FluentSchema
    description: (description: string) => FluentSchema
    examples: (examples: Array<any>) => FluentSchema
    ref: (ref: string) => FluentSchema
    definition: (name: string, props?: FluentSchema) => FluentSchema
    prop: (name: string, props?: FluentSchema) => FluentSchema
    enum: (values: Array<any>) => FluentSchema
    const: (value: any) => FluentSchema
    default: (value: any) => FluentSchema
    required: () => FluentSchema
    not: () => FluentSchema
    anyOf: (attributes: Array<FluentSchema>) => FluentSchema
    allOf: (attributes: Array<FluentSchema>) => FluentSchema
    oneOf: (attributes: Array<FluentSchema>) => FluentSchema
    asString: () => FluentSchema
    minLength: (min: number) => FluentSchema
    maxLength: (min: number) => FluentSchema
    format: (format: FORMATS) => FluentSchema
    pattern: (pattern: string) => FluentSchema
    asNumber: () => FluentSchema
    minimum: (min: number) => FluentSchema
    exclusiveMinimum: (min: number) => FluentSchema
    maximum: (max: number) => FluentSchema
    exclusiveMaximum: (max: number) => FluentSchema
    multipleOf: (multiple: number) => FluentSchema
    asBoolean: () => FluentSchema
    asInteger: () => FluentSchema
    asArray: () => FluentSchema
    items: (items: FluentSchema | FluentSchema[]) => FluentSchema
    additionalItems: (items: FluentSchema | boolean) => FluentSchema
    contains: (value: FluentSchema | boolean) => FluentSchema
    uniqueItems: (boolean: boolean) => FluentSchema
    minItems: (min: number) => FluentSchema
    maxItems: (min: number) => FluentSchema
    asObject: (min: number) => FluentSchema
    additionalProperties: (value: FluentSchema | boolean) => FluentSchema
    maxProperties: (max: number) => FluentSchema
    minProperties: (min: number) => FluentSchema
    patternProperties: (options: PatternPropertiesOptions) => FluentSchema
    dependencies: (options: DependenciesOptions) => FluentSchema
    propertyNames: (value: FluentSchema) => FluentSchema
    asNull: () => FluentSchema
    ifThen: (ifClause: FluentSchema, thenClause: FluentSchema) => FluentSchema
    ifThenElse: (
      ifClause: FluentSchema,
      thenClause: FluentSchema,
      elseClause: FluentSchema
    ) => FluentSchema
  }
}
export = FluentSchema
