## Functions

<dl>
<dt><a href="#ArraySchema">ArraySchema([options])</a> ⇒ <code><a href="#ArraySchema">ArraySchema</a></code></dt>
<dd><p>Represents a ArraySchema.</p>
</dd>
<dt><a href="#items">items(items)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
If &quot;items&quot; is a schema, validation succeeds if all elements in the array successfully validate against that schema.
If &quot;items&quot; is an array of schemas, validation succeeds if each element of the instance validates against the schema at the same position, if any.
Omitting this keyword has the same behavior as an empty schema.</p>
</dd>
<dt><a href="#additionalItems">additionalItems(items)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.</p>
</dd>
<dt><a href="#contains">contains(value)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>An array instance is valid against &quot;contains&quot; if at least one of its elements is valid against the given schema.</p>
</dd>
<dt><a href="#uniqueItems">uniqueItems(boolean)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>If this keyword has boolean value false, the instance validates successfully.
If it has boolean value true, the instance validates successfully if all of its elements are unique.
Omitting this keyword has the same behavior as a value of false.</p>
</dd>
<dt><a href="#minItems">minItems(min)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>An array instance is valid against &quot;minItems&quot; if its size is greater than, or equal to, the value of this keyword.
Omitting this keyword has the same behavior as a value of 0.</p>
</dd>
<dt><a href="#maxItems">maxItems(max)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>An array instance is valid against &quot;minItems&quot; if its size is greater than, or equal to, the value of this keyword.
Omitting this keyword has the same behavior as a value of 0.</p>
</dd>
<dt><a href="#BaseSchema">BaseSchema([options])</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>Represents a BaseSchema.</p>
</dd>
<dt><a href="#id">id(id)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It defines a URI for the schema, and the base URI that other URI references within the schema are resolved against.</p>
<p><a href="https://json-schema.org/latest/json-schema-core.html#id-keyword">reference</a></p>
</dd>
<dt><a href="#title">title(title)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It can be used to decorate a user interface with information about the data produced by this user interface. A title will preferably be short.</p>
<p><a href="https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1">reference</a></p>
</dd>
<dt><a href="#description">description(description)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It can be used to decorate a user interface with information about the data
produced by this user interface. A description provides explanation about
the purpose of the instance described by the schema.</p>
<p><a href="https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1">reference</a></p>
</dd>
<dt><a href="#examples">examples(examples)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value of this keyword MUST be an array.
There are no restrictions placed on the values within the array.</p>
<p><a href="https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.4">reference</a></p>
</dd>
<dt><a href="#ref">ref(ref)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value must be a valid id e.g. #properties/foo</p>
</dd>
<dt><a href="#enum">enum(values)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value of this keyword MUST be an array. This array SHOULD have at least one element. Elements in the array SHOULD be unique.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2</a></p>
</dd>
<dt><a href="#const">const(value)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value of this keyword MAY be of any type, including null.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.3</a></p>
</dd>
<dt><a href="#default">default(defaults)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>There are no restrictions placed on the value of this keyword.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.2</a></p>
</dd>
<dt><a href="#readOnly">readOnly(isReadOnly)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value of readOnly can be left empty to indicate the property is readOnly.
It takes an optional boolean which can be used to explicitly set readOnly true/false</p>
<p><a href="#readOnly">https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3</a></p>
</dd>
<dt><a href="#writeOnly">writeOnly(isWriteOnly)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>The value of writeOnly can be left empty to indicate the property is writeOnly.
It takes an optional boolean which can be used to explicitly set writeOnly true/false</p>
<p><a href="#writeOnly">https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3</a></p>
</dd>
<dt><a href="#required">required()</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>Required has to be chained to a property:
Examples:</p>
<ul>
<li>S.prop(&#39;prop&#39;).required()</li>
<li>S.prop(&#39;prop&#39;, S.number()).required()</li>
<li>S.required([&#39;foo&#39;, &#39;bar&#39;])</li>
</ul>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.3</a></p>
</dd>
<dt><a href="#anyOf">anyOf(schemas)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It  MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.3</a></p>
</dd>
<dt><a href="#allOf">allOf(schemas)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.1</a></p>
</dd>
<dt><a href="#oneOf">oneOf(schemas)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.</p>
</dd>
<dt><a href="#ifThen">ifThen(ifClause, thenClause)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>This validation outcome of this keyword&#39;s subschema has no direct effect on the overall validation result.
Rather, it controls which of the &quot;then&quot; or &quot;else&quot; keywords are evaluated.
When &quot;if&quot; is present, and the instance successfully validates against its subschema, then
validation succeeds against this keyword if the instance also successfully validates against this keyword&#39;s subschema.</p>
</dd>
<dt><a href="#ifThenElse">ifThenElse(ifClause, thenClause, elseClause)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>When &quot;if&quot; is present, and the instance fails to validate against its subschema,
then validation succeeds against this keyword if the instance successfully validates against this keyword&#39;s subschema.</p>
</dd>
<dt><a href="#raw">raw(fragment)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>Because the differences between JSON Schemas and Open API (Swagger)
it can be handy to arbitrary modify the schema injecting a fragment</p>
<ul>
<li>Examples:</li>
<li>S.number().raw({ nullable:true })</li>
<li>S.string().format(&#39;date&#39;).raw({ formatMaximum: &#39;2020-01-01&#39; })</li>
</ul>
</dd>
<dt><a href="#valueOf">valueOf()</a> ⇒ <code><a href="#object">object</a></code></dt>
<dd><p>It returns all the schema values</p>
</dd>
<dt><a href="#BooleanSchema">BooleanSchema([options])</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Represents a BooleanSchema.</p>
</dd>
<dt><a href="#S">S([options])</a> ⇒ <code><a href="#S">S</a></code></dt>
<dd><p>Represents a S.</p>
</dd>
<dt><a href="#string">string()</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Set a property to type string</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1</a></p>
</dd>
<dt><a href="#number">number()</a> ⇒ <code><a href="#NumberSchema">NumberSchema</a></code></dt>
<dd><p>Set a property to type number</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#numeric</a></p>
</dd>
<dt><a href="#integer">integer()</a> ⇒ <code><a href="#IntegerSchema">IntegerSchema</a></code></dt>
<dd><p>Set a property to type integer</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#numeric</a></p>
</dd>
<dt><a href="#boolean">boolean()</a> ⇒ <code><a href="#BooleanSchema">BooleanSchema</a></code></dt>
<dd><p>Set a property to type boolean</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#general</a></p>
</dd>
<dt><a href="#array">array()</a> ⇒ <code><a href="#ArraySchema">ArraySchema</a></code></dt>
<dd><p>Set a property to type array</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4</a></p>
</dd>
<dt><a href="#object">object()</a> ⇒ <code><a href="#ObjectSchema">ObjectSchema</a></code></dt>
<dd><p>Set a property to type object</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5</a></p>
</dd>
<dt><a href="#null">null()</a> ⇒ <code><a href="#NullSchema">NullSchema</a></code></dt>
<dd><p>Set a property to type null</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#general</a></p>
</dd>
<dt><a href="#mixed">mixed(types)</a> ⇒ <code><a href="#MixedSchema">MixedSchema</a></code></dt>
<dd><p>A mixed schema is the union of multiple types (e.g. [&#39;string&#39;, &#39;integer&#39;]</p>
</dd>
<dt><a href="#raw">raw(fragment)</a> ⇒ <code><a href="#BaseSchema">BaseSchema</a></code></dt>
<dd><p>Because the differences between JSON Schemas and Open API (Swagger)
it can be handy to arbitrary modify the schema injecting a fragment</p>
<ul>
<li>Examples:</li>
<li>S.raw({ nullable:true, format: &#39;date&#39;, formatMaximum: &#39;2020-01-01&#39; })</li>
<li>S.string().format(&#39;date&#39;).raw({ formatMaximum: &#39;2020-01-01&#39; })</li>
</ul>
</dd>
<dt><a href="#IntegerSchema">IntegerSchema([options])</a> ⇒ <code><a href="#NumberSchema">NumberSchema</a></code></dt>
<dd><p>Represents a NumberSchema.</p>
</dd>
<dt><a href="#MixedSchema">MixedSchema([options])</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Represents a MixedSchema.</p>
</dd>
<dt><a href="#NullSchema">NullSchema([options])</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Represents a NullSchema.</p>
</dd>
<dt><a href="#null">null()</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>Set a property to type null</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1</a></p>
</dd>
<dt><a href="#NumberSchema">NumberSchema([options])</a> ⇒ <code><a href="#NumberSchema">NumberSchema</a></code></dt>
<dd><p>Represents a NumberSchema.</p>
</dd>
<dt><a href="#minimum">minimum(min)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>It represents  an inclusive lower limit for a numeric instance.</p>
</dd>
<dt><a href="#exclusiveMinimum">exclusiveMinimum()</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>It represents an exclusive lower limit for a numeric instance.</p>
<ul>
<li>@param {number} min
<a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.5</a></li>
</ul>
</dd>
<dt><a href="#maximum">maximum()</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>It represents  an inclusive upper limit for a numeric instance.
<a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.2</a></p>
</dd>
<dt><a href="#exclusiveMaximum">exclusiveMaximum(max)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>It represents an exclusive upper limit for a numeric instance.</p>
</dd>
<dt><a href="#multipleOf">multipleOf(multiple)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>It&#39;s strictly greater than 0.</p>
</dd>
<dt><a href="#ObjectSchema">ObjectSchema([options])</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Represents a ObjectSchema.</p>
</dd>
<dt><a href="#additionalProperties">additionalProperties(value)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
Validation with &quot;additionalProperties&quot; applies only to the child values of instance names that do not match any names in &quot;properties&quot;,
and do not match any regular expression in &quot;patternProperties&quot;.
For all such properties, validation succeeds if the child instance validates against the &quot;additionalProperties&quot; schema.
Omitting this keyword has the same behavior as an empty schema.</p>
</dd>
<dt><a href="#maxProperties">maxProperties(max)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>An object instance is valid against &quot;maxProperties&quot; if its number of properties is less than, or equal to, the value of this keyword.</p>
</dd>
<dt><a href="#minProperties">minProperties(min)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>An object instance is valid against &quot;minProperties&quot; if its number of properties is greater than, or equal to, the value of this keyword.</p>
</dd>
<dt><a href="#patternProperties">patternProperties(opts)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>Each property name of this object SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
Each property value of this object MUST be a valid JSON Schema.
This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
Validation of the primitive instance type against this keyword always succeeds.
Validation succeeds if, for each instance name that matches any regular expressions that appear as a property name in this keyword&#39;s value, the child instance for that name successfully validates against each schema that corresponds to a matching regular expression.</p>
</dd>
<dt><a href="#dependencies">dependencies(opts)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>This keyword specifies rules that are evaluated if the instance is an object and contains a certain property.
This keyword&#39;s value MUST be an object. Each property specifies a dependency. Each dependency value MUST be an array or a valid JSON Schema.
If the dependency value is a subschema, and the dependency key is a property in the instance, the entire instance must validate against the dependency value.
If the dependency value is an array, each element in the array, if any, MUST be a string, and MUST be unique. If the dependency key is a property in the instance, each of the items in the dependency value must be a property that exists in the instance.</p>
</dd>
<dt><a href="#propertyNames">propertyNames(value)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.
Note the property name that the schema is testing will always be a string.</p>
</dd>
<dt><a href="#prop">prop(name, props)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>The value of &quot;properties&quot; MUST be an object. Each value of this object MUST be a valid JSON Schema</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.4</a></p>
</dd>
<dt><a href="#definition">definition(name, props)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>The &quot;definitions&quot; keywords provides a standardized location for schema authors to inline re-usable JSON Schemas into a more general schema.
There are no restrictions placed on the values within the array.</p>
<p><a href="reference">https://json-schema.org/latest/json-schema-validation.html#rfc.section.9</a></p>
</dd>
<dt><a href="#RawSchema">RawSchema(schema)</a> ⇒ <code>FluentSchema</code></dt>
<dd><p>Represents a raw JSON Schema that will be parsed</p>
</dd>
<dt><a href="#StringSchema">StringSchema([options])</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>Represents a StringSchema.</p>
</dd>
<dt><a href="#minLength">minLength(min)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].</p>
</dd>
<dt><a href="#maxLength">maxLength(max)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].</p>
</dd>
<dt><a href="#format">format(format)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>A string value can be RELATIVE_JSON_POINTER, JSON_POINTER, UUID, REGEX, IPV6, IPV4, HOSTNAME, EMAIL, URL, URI_TEMPLATE, URI_REFERENCE, URI, TIME, DATE,</p>
</dd>
<dt><a href="#pattern">pattern(pattern)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
 A string instance is considered valid if the regular expression matches the instance successfully.</p>
</dd>
<dt><a href="#contentEncoding">contentEncoding(encoding)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>If the instance value is a string, this property defines that the string SHOULD
 be interpreted as binary data and decoded using the encoding named by this property.
 RFC 2045, Sec 6.1 [RFC2045] lists the possible values for this property.</p>
</dd>
<dt><a href="#contentMediaType">contentMediaType(mediaType)</a> ⇒ <code><a href="#StringSchema">StringSchema</a></code></dt>
<dd><p>The value of this property must be a media type, as defined by RFC 2046 [RFC2046].
 This property defines the media type of instances which this schema defines.</p>
</dd>
</dl>

<a name="ArraySchema"></a>

## ArraySchema([options]) ⇒ [<code>ArraySchema</code>](#ArraySchema)

Represents a ArraySchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>StringSchema</code>](#StringSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="items"></a>

## items(items) ⇒ <code>FluentSchema</code>

This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.
If "items" is a schema, validation succeeds if all elements in the array successfully validate against that schema.
If "items" is an array of schemas, validation succeeds if each element of the instance validates against the schema at the same position, if any.
Omitting this keyword has the same behavior as an empty schema.

**Kind**: global function

| Param | Type                                                                 | Description                                                                               |
| ----- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| items | <code>FluentSchema</code> \| <code>Array.&lt;FluentSchema&gt;</code> | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.1](reference) |

<a name="additionalItems"></a>

## additionalItems(items) ⇒ <code>FluentSchema</code>

This keyword determines how child instances validate for arrays, and does not directly validate the immediate instance itself.

**Kind**: global function

| Param | Type                                                          | Description                                                                               |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| items | <code>FluentSchema</code> \| [<code>boolean</code>](#boolean) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.2](reference) |

<a name="contains"></a>

## contains(value) ⇒ <code>FluentSchema</code>

An array instance is valid against "contains" if at least one of its elements is valid against the given schema.

**Kind**: global function

| Param | Type                      | Description                                                                               |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------- |
| value | <code>FluentSchema</code> | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.2](reference) |

<a name="uniqueItems"></a>

## uniqueItems(boolean) ⇒ <code>FluentSchema</code>

If this keyword has boolean value false, the instance validates successfully.
If it has boolean value true, the instance validates successfully if all of its elements are unique.
Omitting this keyword has the same behavior as a value of false.

**Kind**: global function

| Param   | Type                             | Description                                                                               |
| ------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| boolean | [<code>boolean</code>](#boolean) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.5](reference) |

<a name="minItems"></a>

## minItems(min) ⇒ <code>FluentSchema</code>

An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
Omitting this keyword has the same behavior as a value of 0.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| min   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.4](reference) |

<a name="maxItems"></a>

## maxItems(max) ⇒ <code>FluentSchema</code>

An array instance is valid against "minItems" if its size is greater than, or equal to, the value of this keyword.
Omitting this keyword has the same behavior as a value of 0.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| max   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.3](reference) |

<a name="BaseSchema"></a>

## BaseSchema([options]) ⇒ [<code>BaseSchema</code>](#BaseSchema)

Represents a BaseSchema.

**Kind**: global function

| Param                 | Type                                   | Default            | Description                                        |
| --------------------- | -------------------------------------- | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                    |                    | Options                                            |
| [options.schema]      | [<code>BaseSchema</code>](#BaseSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)       | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="id"></a>

## id(id) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It defines a URI for the schema, and the base URI that other URI references within the schema are resolved against.

[reference](https://json-schema.org/latest/json-schema-core.html#id-keyword)

**Kind**: global function

| Param | Type                           | Description |
| ----- | ------------------------------ | ----------- |
| id    | [<code>string</code>](#string) | an #id      |

<a name="title"></a>

## title(title) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It can be used to decorate a user interface with information about the data produced by this user interface. A title will preferably be short.

[reference](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1)

**Kind**: global function

| Param | Type                           |
| ----- | ------------------------------ |
| title | [<code>string</code>](#string) |

<a name="description"></a>

## description(description) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It can be used to decorate a user interface with information about the data
produced by this user interface. A description provides explanation about
the purpose of the instance described by the schema.

[reference](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.1)

**Kind**: global function

| Param       | Type                           |
| ----------- | ------------------------------ |
| description | [<code>string</code>](#string) |

<a name="examples"></a>

## examples(examples) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value of this keyword MUST be an array.
There are no restrictions placed on the values within the array.

[reference](https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.4)

**Kind**: global function

| Param    | Type                           |
| -------- | ------------------------------ |
| examples | [<code>string</code>](#string) |

<a name="ref"></a>

## ref(ref) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value must be a valid id e.g. #properties/foo

**Kind**: global function

| Param | Type                           |
| ----- | ------------------------------ |
| ref   | [<code>string</code>](#string) |

<a name="enum"></a>

## enum(values) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value of this keyword MUST be an array. This array SHOULD have at least one element. Elements in the array SHOULD be unique.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2](reference)

**Kind**: global function

| Param  | Type                         |
| ------ | ---------------------------- |
| values | [<code>array</code>](#array) |

<a name="const"></a>

## const(value) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value of this keyword MAY be of any type, including null.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.3](reference)

**Kind**: global function

| Param |
| ----- |
| value |

<a name="default"></a>

## default(defaults) ⇒ [<code>BaseSchema</code>](#BaseSchema)

There are no restrictions placed on the value of this keyword.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.2](reference)

**Kind**: global function

| Param    |
| -------- |
| defaults |

<a name="readOnly"></a>

## readOnly(isReadOnly) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value of readOnly can be left empty to indicate the property is readOnly.
It takes an optional boolean which can be used to explicitly set readOnly true/false

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3](#readOnly)

**Kind**: global function

| Param      | Type                                                       |
| ---------- | ---------------------------------------------------------- |
| isReadOnly | [<code>boolean</code>](#boolean) \| <code>undefined</code> |

<a name="writeOnly"></a>

## writeOnly(isWriteOnly) ⇒ [<code>BaseSchema</code>](#BaseSchema)

The value of writeOnly can be left empty to indicate the property is writeOnly.
It takes an optional boolean which can be used to explicitly set writeOnly true/false

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.10.3](#writeOnly)

**Kind**: global function

| Param       | Type                                                       |
| ----------- | ---------------------------------------------------------- |
| isWriteOnly | [<code>boolean</code>](#boolean) \| <code>undefined</code> |

<a name="required"></a>

## required() ⇒ <code>FluentSchema</code>

Required has to be chained to a property:
Examples:

- S.prop('prop').required()
- S.prop('prop', S.number()).required()
- S.required(['foo', 'bar'])

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.3](reference)

**Kind**: global function  
<a name="anyOf"></a>

## anyOf(schemas) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.3](reference)

**Kind**: global function

| Param   | Type                         |
| ------- | ---------------------------- |
| schemas | [<code>array</code>](#array) |

<a name="allOf"></a>

## allOf(schemas) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.1](reference)

**Kind**: global function

| Param   | Type                         |
| ------- | ---------------------------- |
| schemas | [<code>array</code>](#array) |

<a name="oneOf"></a>

## oneOf(schemas) ⇒ [<code>BaseSchema</code>](#BaseSchema)

It MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.

**Kind**: global function

| Param   | Type                         | Description                                                                               |
| ------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| schemas | [<code>array</code>](#array) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.2](reference) |

<a name="ifThen"></a>

## ifThen(ifClause, thenClause) ⇒ [<code>BaseSchema</code>](#BaseSchema)

This validation outcome of this keyword's subschema has no direct effect on the overall validation result.
Rather, it controls which of the "then" or "else" keywords are evaluated.
When "if" is present, and the instance successfully validates against its subschema, then
validation succeeds against this keyword if the instance also successfully validates against this keyword's subschema.

**Kind**: global function

| Param      | Type                                   | Description                                                                               |
| ---------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| ifClause   | [<code>BaseSchema</code>](#BaseSchema) |                                                                                           |
| thenClause | [<code>BaseSchema</code>](#BaseSchema) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.6.1](reference) |

<a name="ifThenElse"></a>

## ifThenElse(ifClause, thenClause, elseClause) ⇒ [<code>BaseSchema</code>](#BaseSchema)

When "if" is present, and the instance fails to validate against its subschema,
then validation succeeds against this keyword if the instance successfully validates against this keyword's subschema.

**Kind**: global function

| Param      | Type                                   | Description                                                                               |
| ---------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| ifClause   | [<code>BaseSchema</code>](#BaseSchema) |                                                                                           |
| thenClause | [<code>BaseSchema</code>](#BaseSchema) |                                                                                           |
| elseClause | [<code>BaseSchema</code>](#BaseSchema) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.6.1](reference) |

<a name="raw"></a>

## raw(fragment) ⇒ [<code>BaseSchema</code>](#BaseSchema)

Because the differences between JSON Schemas and Open API (Swagger)
it can be handy to arbitrary modify the schema injecting a fragment

- Examples:

* S.number().raw({ nullable:true })
* S.string().format('date').raw({ formatMaximum: '2020-01-01' })

**Kind**: global function

| Param    | Type                           | Description                                                                                                                  |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| fragment | [<code>string</code>](#string) | an arbitrary JSON Schema to inject [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3](reference) |

<a name="valueOf"></a>

## valueOf() ⇒ [<code>object</code>](#object)

It returns all the schema values

**Kind**: global function  
<a name="BooleanSchema"></a>

## BooleanSchema([options]) ⇒ [<code>StringSchema</code>](#StringSchema)

Represents a BooleanSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>StringSchema</code>](#StringSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="S"></a>

## S([options]) ⇒ [<code>S</code>](#S)

Represents a S.

**Kind**: global function

| Param                 | Type                             | Default            | Description                                        |
| --------------------- | -------------------------------- | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>              |                    | Options                                            |
| [options.schema]      | [<code>S</code>](#S)             |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean) | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="string"></a>

## string() ⇒ [<code>StringSchema</code>](#StringSchema)

Set a property to type string

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1](reference)

**Kind**: global function  
<a name="number"></a>

## number() ⇒ [<code>NumberSchema</code>](#NumberSchema)

Set a property to type number

[https://json-schema.org/latest/json-schema-validation.html#numeric](reference)

**Kind**: global function  
<a name="integer"></a>

## integer() ⇒ [<code>IntegerSchema</code>](#IntegerSchema)

Set a property to type integer

[https://json-schema.org/latest/json-schema-validation.html#numeric](reference)

**Kind**: global function  
<a name="boolean"></a>

## boolean() ⇒ [<code>BooleanSchema</code>](#BooleanSchema)

Set a property to type boolean

[https://json-schema.org/latest/json-schema-validation.html#general](reference)

**Kind**: global function  
<a name="array"></a>

## array() ⇒ [<code>ArraySchema</code>](#ArraySchema)

Set a property to type array

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4](reference)

**Kind**: global function  
<a name="object"></a>

## object() ⇒ [<code>ObjectSchema</code>](#ObjectSchema)

Set a property to type object

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5](reference)

**Kind**: global function  
<a name="null"></a>

## null() ⇒ [<code>NullSchema</code>](#NullSchema)

Set a property to type null

[https://json-schema.org/latest/json-schema-validation.html#general](reference)

**Kind**: global function  
<a name="mixed"></a>

## mixed(types) ⇒ [<code>MixedSchema</code>](#MixedSchema)

A mixed schema is the union of multiple types (e.g. ['string', 'integer']

**Kind**: global function

| Param | Type                                                         |
| ----- | ------------------------------------------------------------ |
| types | [<code>[ &#x27;Array&#x27; ].&lt;string&gt;</code>](#string) |

<a name="raw"></a>

## raw(fragment) ⇒ [<code>BaseSchema</code>](#BaseSchema)

Because the differences between JSON Schemas and Open API (Swagger)
it can be handy to arbitrary modify the schema injecting a fragment

- Examples:

* S.raw({ nullable:true, format: 'date', formatMaximum: '2020-01-01' })
* S.string().format('date').raw({ formatMaximum: '2020-01-01' })

**Kind**: global function

| Param    | Type                           | Description                                                                                                                  |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| fragment | [<code>string</code>](#string) | an arbitrary JSON Schema to inject [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3](reference) |

<a name="IntegerSchema"></a>

## IntegerSchema([options]) ⇒ [<code>NumberSchema</code>](#NumberSchema)

Represents a NumberSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>NumberSchema</code>](#NumberSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="MixedSchema"></a>

## MixedSchema([options]) ⇒ [<code>StringSchema</code>](#StringSchema)

Represents a MixedSchema.

**Kind**: global function

| Param                 | Type                                     | Default            | Description                                        |
| --------------------- | ---------------------------------------- | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                      |                    | Options                                            |
| [options.schema]      | [<code>MixedSchema</code>](#MixedSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)         | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="NullSchema"></a>

## NullSchema([options]) ⇒ [<code>StringSchema</code>](#StringSchema)

Represents a NullSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>StringSchema</code>](#StringSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="null"></a>

## null() ⇒ <code>FluentSchema</code>

Set a property to type null

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.1](reference)

**Kind**: global function  
<a name="NumberSchema"></a>

## NumberSchema([options]) ⇒ [<code>NumberSchema</code>](#NumberSchema)

Represents a NumberSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>NumberSchema</code>](#NumberSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="minimum"></a>

## minimum(min) ⇒ <code>FluentSchema</code>

It represents an inclusive lower limit for a numeric instance.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| min   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.4](reference) |

<a name="exclusiveMinimum"></a>

## exclusiveMinimum() ⇒ <code>FluentSchema</code>

It represents an exclusive lower limit for a numeric instance.

- @param {number} min
  [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.5](reference)

**Kind**: global function  
<a name="maximum"></a>

## maximum() ⇒ <code>FluentSchema</code>

It represents an inclusive upper limit for a numeric instance.
[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.2](reference)

**Kind**: global function  
<a name="exclusiveMaximum"></a>

## exclusiveMaximum(max) ⇒ <code>FluentSchema</code>

It represents an exclusive upper limit for a numeric instance.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| max   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.3](reference) |

<a name="multipleOf"></a>

## multipleOf(multiple) ⇒ <code>FluentSchema</code>

It's strictly greater than 0.

**Kind**: global function

| Param    | Type                           | Description                                                                               |
| -------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| multiple | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.2.1](reference) |

<a name="ObjectSchema"></a>

## ObjectSchema([options]) ⇒ [<code>StringSchema</code>](#StringSchema)

Represents a ObjectSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>StringSchema</code>](#StringSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="additionalProperties"></a>

## additionalProperties(value) ⇒ <code>FluentSchema</code>

This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
Validation with "additionalProperties" applies only to the child values of instance names that do not match any names in "properties",
and do not match any regular expression in "patternProperties".
For all such properties, validation succeeds if the child instance validates against the "additionalProperties" schema.
Omitting this keyword has the same behavior as an empty schema.

**Kind**: global function

| Param | Type                                                          | Description                                                                               |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| value | <code>FluentSchema</code> \| [<code>boolean</code>](#boolean) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.6](reference) |

<a name="maxProperties"></a>

## maxProperties(max) ⇒ <code>FluentSchema</code>

An object instance is valid against "maxProperties" if its number of properties is less than, or equal to, the value of this keyword.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| max   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.1](reference) |

<a name="minProperties"></a>

## minProperties(min) ⇒ <code>FluentSchema</code>

An object instance is valid against "minProperties" if its number of properties is greater than, or equal to, the value of this keyword.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| min   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.2](reference) |

<a name="patternProperties"></a>

## patternProperties(opts) ⇒ <code>FluentSchema</code>

Each property name of this object SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
Each property value of this object MUST be a valid JSON Schema.
This keyword determines how child instances validate for objects, and does not directly validate the immediate instance itself.
Validation of the primitive instance type against this keyword always succeeds.
Validation succeeds if, for each instance name that matches any regular expressions that appear as a property name in this keyword's value, the child instance for that name successfully validates against each schema that corresponds to a matching regular expression.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| opts  | [<code>object</code>](#object) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.5](reference) |

<a name="dependencies"></a>

## dependencies(opts) ⇒ <code>FluentSchema</code>

This keyword specifies rules that are evaluated if the instance is an object and contains a certain property.
This keyword's value MUST be an object. Each property specifies a dependency. Each dependency value MUST be an array or a valid JSON Schema.
If the dependency value is a subschema, and the dependency key is a property in the instance, the entire instance must validate against the dependency value.
If the dependency value is an array, each element in the array, if any, MUST be a string, and MUST be unique. If the dependency key is a property in the instance, each of the items in the dependency value must be a property that exists in the instance.

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| opts  | [<code>object</code>](#object) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7](reference) |

<a name="propertyNames"></a>

## propertyNames(value) ⇒ <code>FluentSchema</code>

If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.
Note the property name that the schema is testing will always be a string.

**Kind**: global function

| Param | Type                      | Description                                                                               |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------- |
| value | <code>FluentSchema</code> | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.7](reference) |

<a name="prop"></a>

## prop(name, props) ⇒ <code>FluentSchema</code>

The value of "properties" MUST be an object. Each value of this object MUST be a valid JSON Schema

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.5.4](reference)

**Kind**: global function

| Param | Type                           |
| ----- | ------------------------------ |
| name  | [<code>string</code>](#string) |
| props | <code>FluentSchema</code>      |

<a name="definition"></a>

## definition(name, props) ⇒ <code>FluentSchema</code>

The "definitions" keywords provides a standardized location for schema authors to inline re-usable JSON Schemas into a more general schema.
There are no restrictions placed on the values within the array.

[https://json-schema.org/latest/json-schema-validation.html#rfc.section.9](reference)

**Kind**: global function

| Param | Type                           |
| ----- | ------------------------------ |
| name  | [<code>string</code>](#string) |
| props | <code>FluentSchema</code>      |

<a name="RawSchema"></a>

## RawSchema(schema) ⇒ <code>FluentSchema</code>

Represents a raw JSON Schema that will be parsed

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| schema | <code>Object</code> |

<a name="StringSchema"></a>

## StringSchema([options]) ⇒ [<code>StringSchema</code>](#StringSchema)

Represents a StringSchema.

**Kind**: global function

| Param                 | Type                                       | Default            | Description                                        |
| --------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| [options]             | <code>Object</code>                        |                    | Options                                            |
| [options.schema]      | [<code>StringSchema</code>](#StringSchema) |                    | Default schema                                     |
| [options.generateIds] | [<code>boolean</code>](#boolean)           | <code>false</code> | generate the id automatically e.g. #properties.foo |

<a name="minLength"></a>

## minLength(min) ⇒ [<code>StringSchema</code>](#StringSchema)

A string instance is valid against this keyword if its length is greater than, or equal to, the value of this keyword.
The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| min   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2](reference) |

<a name="maxLength"></a>

## maxLength(max) ⇒ [<code>StringSchema</code>](#StringSchema)

A string instance is valid against this keyword if its length is less than, or equal to, the value of this keyword.
The length of a string instance is defined as the number of its characters as defined by RFC 7159 [RFC7159].

**Kind**: global function

| Param | Type                           | Description                                                                               |
| ----- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| max   | [<code>number</code>](#number) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.2](reference) |

<a name="format"></a>

## format(format) ⇒ [<code>StringSchema</code>](#StringSchema)

A string value can be RELATIVE_JSON_POINTER, JSON_POINTER, UUID, REGEX, IPV6, IPV4, HOSTNAME, EMAIL, URL, URI_TEMPLATE, URI_REFERENCE, URI, TIME, DATE,

**Kind**: global function

| Param  | Type                           | Description                                                                             |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| format | [<code>string</code>](#string) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.7.3](reference) |

<a name="pattern"></a>

## pattern(pattern) ⇒ [<code>StringSchema</code>](#StringSchema)

This string SHOULD be a valid regular expression, according to the ECMA 262 regular expression dialect.
A string instance is considered valid if the regular expression matches the instance successfully.

**Kind**: global function

| Param   | Type                           | Description                                                                               |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| pattern | [<code>string</code>](#string) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.6.3.3](reference) |

<a name="contentEncoding"></a>

## contentEncoding(encoding) ⇒ [<code>StringSchema</code>](#StringSchema)

If the instance value is a string, this property defines that the string SHOULD
be interpreted as binary data and decoded using the encoding named by this property.
RFC 2045, Sec 6.1 [RFC2045] lists the possible values for this property.

**Kind**: global function

| Param    | Type                           | Description                                                                             |
| -------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| encoding | [<code>string</code>](#string) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3](reference) |

<a name="contentMediaType"></a>

## contentMediaType(mediaType) ⇒ [<code>StringSchema</code>](#StringSchema)

The value of this property must be a media type, as defined by RFC 2046 [RFC2046].
This property defines the media type of instances which this schema defines.

**Kind**: global function

| Param     | Type                           | Description                                                                             |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| mediaType | [<code>string</code>](#string) | [https://json-schema.org/latest/json-schema-validation.html#rfc.section.8.3](reference) |
