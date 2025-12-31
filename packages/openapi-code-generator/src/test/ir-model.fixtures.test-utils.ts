import type {
  IRModelAny,
  IRModelArray,
  IRModelBoolean,
  IRModelIntersection,
  IRModelNever,
  IRModelNull,
  IRModelNumeric,
  IRModelObject,
  IRModelRecord,
  IRModelString,
  IRModelUnion,
  IROperationParameters,
  IRParameterCookie,
  IRParameterHeader,
  IRParameterPath,
  IRParameterQuery,
  IRRef,
} from "../core/openapi-types-normalized"

const base = {
  any: {
    isIRModel: true,
    type: "any",
    default: undefined,
    nullable: false,
    "x-internal-preprocess": undefined,
  } satisfies IRModelAny,
  never: {
    isIRModel: true,
    type: "never",
    default: undefined,
    nullable: false,
    "x-internal-preprocess": undefined,
  } satisfies IRModelNever,
  object: {
    isIRModel: true,
    type: "object",
    default: undefined,
    nullable: false,
    properties: {},
    required: [],
    additionalProperties: undefined,
    "x-internal-preprocess": undefined,
  } satisfies IRModelObject,
  array: {
    isIRModel: true,
    type: "array",
    default: undefined,
    nullable: false,
    uniqueItems: false,
    minItems: undefined,
    maxItems: undefined,
    "x-internal-preprocess": undefined,
  } satisfies Omit<IRModelArray, "items">,
  string: {
    isIRModel: true,
    type: "string",
    format: undefined,
    default: undefined,
    enum: undefined,
    maxLength: undefined,
    minLength: undefined,
    nullable: false,
    pattern: undefined,
    "x-enum-extensibility": undefined,
    "x-internal-preprocess": undefined,
  } satisfies IRModelString,
  number: {
    isIRModel: true,
    type: "number",
    format: undefined,
    default: undefined,
    enum: undefined,
    exclusiveMaximum: undefined,
    exclusiveMinimum: undefined,
    inclusiveMaximum: undefined,
    inclusiveMinimum: undefined,
    multipleOf: undefined,
    nullable: false,
    "x-enum-extensibility": undefined,
    "x-internal-preprocess": undefined,
  } satisfies IRModelNumeric,
  boolean: {
    isIRModel: true,
    type: "boolean",
    default: undefined,
    enum: undefined,
    nullable: false,
    "x-internal-preprocess": undefined,
  } satisfies IRModelBoolean,
}

const extension = {
  record: {
    isIRModel: true,
    type: "record",
    key: base.string,
    value: base.any,
    default: undefined,
    nullable: false,
    "x-internal-preprocess": undefined,
  } satisfies IRModelRecord,
  intersection: {
    isIRModel: true,
    type: "intersection",
    schemas: [base.any],
    nullable: false,
    default: undefined,
    "x-internal-preprocess": undefined,
  } satisfies IRModelIntersection,
  union: {
    isIRModel: true,
    type: "union",
    schemas: [base.any],
    nullable: false,
    default: undefined,
    "x-internal-preprocess": undefined,
  } satisfies IRModelUnion,
  null: {
    isIRModel: true,
    type: "null",
    nullable: false,
  } satisfies IRModelNull,
}

const parameters = {
  path: {
    name: "id",
    in: "path",
    required: true,
    schema: base.string,
    style: "simple",
    explode: false,
    deprecated: false,
    description: undefined,
  } satisfies IRParameterPath,
  query: {
    name: "filter",
    in: "query",
    required: false,
    schema: base.string,
    style: "form",
    explode: true,
    deprecated: false,
    description: undefined,
    allowEmptyValue: false,
  } satisfies IRParameterQuery,
  header: {
    name: "X-Header",
    in: "header",
    required: false,
    schema: base.string,
    style: "simple",
    explode: false,
    deprecated: false,
    description: undefined,
  } satisfies IRParameterHeader,
  cookie: {
    name: "session",
    in: "cookie",
    required: false,
    schema: base.string,
    style: "form",
    explode: true,
    deprecated: false,
    description: undefined,
  } satisfies IRParameterCookie,
  operation: {
    all: [],
    path: {name: "pathParameters", list: [], $ref: undefined},
    query: {name: "queryParameters", list: [], $ref: undefined},
    header: {name: "headerParameters", list: [], $ref: undefined},
  } satisfies IROperationParameters,
}

export const irFixture = {
  ref(path: string, file = ""): IRRef {
    return {
      $ref: `${file}#${path}`,
      "x-internal-preprocess": undefined,
    }
  },
  any(partial: Partial<IRModelAny> = {}): IRModelAny {
    return {...base.any, ...partial}
  },
  never(partial: Partial<IRModelNever> = {}): IRModelNever {
    return {...base.never, ...partial}
  },
  object(partial: Partial<IRModelObject> = {}): IRModelObject {
    return {...base.object, ...partial}
  },
  array(
    partial: Partial<IRModelArray> & Pick<IRModelArray, "items">,
  ): IRModelArray {
    return {...base.array, ...partial}
  },
  string(partial: Partial<IRModelString> = {}): IRModelString {
    return {...base.string, ...partial}
  },
  number(partial: Partial<IRModelNumeric> = {}): IRModelNumeric {
    return {...base.number, ...partial}
  },
  boolean(partial: Partial<IRModelBoolean> = {}): IRModelBoolean {
    return {...base.boolean, ...partial}
  },
  record(partial: Partial<IRModelRecord> = {}): IRModelRecord {
    return {...extension.record, ...partial}
  },
  intersection(
    partial: Partial<IRModelIntersection> = {},
  ): IRModelIntersection {
    return {...extension.intersection, ...partial}
  },
  union(partial: Partial<IRModelUnion> = {}): IRModelUnion {
    return {...extension.union, ...partial}
  },
  null(partial: Partial<IRModelNull> = {}): IRModelNull {
    return {...extension.null, ...partial}
  },
  pathParameter(partial: Partial<IRParameterPath> = {}): IRParameterPath {
    return {...parameters.path, ...partial}
  },
  queryParameter(partial: Partial<IRParameterQuery> = {}): IRParameterQuery {
    return {...parameters.query, ...partial}
  },
  headerParameter(partial: Partial<IRParameterHeader> = {}): IRParameterHeader {
    return {...parameters.header, ...partial}
  },
  cookieParameter(partial: Partial<IRParameterCookie> = {}): IRParameterCookie {
    return {...parameters.cookie, ...partial}
  },
  operationParameters(
    partial: Partial<IROperationParameters> = {},
  ): IROperationParameters {
    return {...parameters.operation, ...partial}
  },
}
