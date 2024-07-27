import {z} from "zod"
import {KoaRuntimeError, type RequestInputType} from "./errors"

export type Params<Params, Query, Body> = {
  params: Params
  query: Query
  body: Body
}

export type Bidirectional<
  Serialized,
  Deserialized,
  Serialize extends z.ZodType<
    Serialized,
    z.ZodTypeDef,
    Deserialized
  > = z.ZodType<Serialized, z.ZodTypeDef, Deserialized>,
  Deserialize extends z.ZodType<
    Deserialized,
    z.ZodTypeDef,
    Serialized
  > = z.ZodType<Deserialized, z.ZodTypeDef, Serialized>,
> = {
  _symbol: typeof _bidirectional
  serialize: Serialize
  deserialize: Deserialize
}

const _bidirectional = Symbol("bidirectional")

const s_datetime: Bidirectional<string, Date> = {
  _symbol: _bidirectional,
  serialize: z.date().transform((it) => it.toISOString()),
  deserialize: z
    .string()
    .datetime()
    .transform((it) => new Date(it)),
}

s_datetime.deserialize.parse(new Date())

// <T extends ZodRawShape>(shape: T, params?: RawCreateParams) =>
// ZodObject<T, "strip", ZodTypeAny, { [k in keyof objectUtil.addQuestionMarks<baseObjectOutputType<T>, any>]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, any>[k]; }, { [k_1 in keyof baseObjectInputType<T>]: baseObjectInputType<T>[k_1]; }>;

type RoundTripRawShape = {
  [key: string]:
    | z.ZodTypeAny
    | Bidirectional<unknown, unknown>
    | RoundTripRawShape
}

// function expandTest<T extends {[key: string]: unknown | {value: unknown}}>(
//   input: T,
// ): {[k in keyof T]: T[k] extends {value: number} ? T[k]["value"] : T[k]} {
//   return Object.fromEntries(
//     Object.entries(input).map(([key, value]) => [
//       key,
//       typeof value === "number" ? value : value.value,
//     ]),
//   ) as any
// }

// const foo = expandTest({
//   a: 123 as const,
//   b: {value: 512},
// })

function foo<
  T extends Bidirectional<any, any>,
  U extends RoundTripRawShape,
  V extends z.ZodTypeAny,
>(
  it: U,
): {
  [k in keyof U]: U[k] extends Bidirectional<unknown, unknown>
    ? U[k]["serialize"]
    : U[k]
}
function foo<
  T extends Bidirectional<any, any>,
  U extends RoundTripRawShape,
  V extends z.ZodTypeAny,
>(it: V): V
function foo<
  T extends Bidirectional<any, any>,
  U extends RoundTripRawShape,
  V extends z.ZodTypeAny,
>(it: T): T["serialize"]
function foo<
  T extends Bidirectional<any, any>,
  U extends RoundTripRawShape,
  V extends z.ZodTypeAny,
>(it: T | U | V) {}

function expandSerialize<T extends RoundTripRawShape>(
  shape: T,
): {
  [k in keyof T]: T[k] extends Bidirectional<any, any>
    ? T[k]["serialize"]
    : T[k]
} {
  return Object.fromEntries(
    Object.entries(shape).map(([key, value]) => {
      return [key, isZodSchema(value) ? value : value.serialize] as const
    }),
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ) as any
}

function expandDeserialize<T extends RoundTripRawShape>(
  shape: T,
): {
  [k in keyof T]: T[k] extends Bidirectional<unknown, unknown>
    ? T[k]["deserialize"]
    : T[k]
} {
  return Object.fromEntries(
    Object.entries(shape).map(([key, value]) => {
      return [key, isZodSchema(value) ? value : value.deserialize] as const
    }),
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  ) as any
}

function expand<T extends RoundTripRawShape>(shape: T) {
  return {
    serialize: expandSerialize(shape),
    deserialize: expandDeserialize(shape),
  }
}

function roundtripObject<T extends RoundTripRawShape>(properties: T) {
  const shape = expand(properties)
  return {
    serialize: z.object(shape.serialize),
    // deserialize: z.object(expandDeserialize<T>(properties)),
  }
}

const foo3 = (() => {
  const shape = expand({
    name: z.string(),
    created: s_datetime,
    nested: {
      age: z.number(),
      updated: s_datetime,
    },
  })

  return {
    serialize: z.object(shape.serialize),
    deserialize: z.object(shape.deserialize),
  }
})()

const s = foo3.deserialize.parse({})

const foo2 = z.object(
  expand({
    name: z.string(),
    created: s_datetime,
  }).deserialize,
)

const bar = foo2.parse({name: "test", created: "123"})

const result = foo.serialize.parse({
  name: "string",
  created: new Date().toISOString(),
})

function isZodSchema(z: unknown): z is z.ZodTypeAny {
  return typeof z === "object" && z !== null && Reflect.has(z, "parse")
}

export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema,
  input: unknown,
  type: RequestInputType,
): z.infer<Schema>
export function parseRequestInput(
  schema: undefined,
  input: unknown,
  type: RequestInputType,
): undefined
export function parseRequestInput<Schema extends z.ZodTypeAny>(
  schema: Schema | undefined,
  input: unknown,
  type: RequestInputType,
): z.infer<Schema> | undefined {
  try {
    return schema?.parse(input)
  } catch (err) {
    throw KoaRuntimeError.RequestError(err, type)
  }
}

// TODO: optional response validation
export function responseValidationFactory(
  possibleResponses: [string, z.ZodTypeAny][],
  defaultResponse?: z.ZodTypeAny,
) {
  // Exploit the natural ordering matching the desired specificity of eg: 404 vs 4xx
  possibleResponses.sort((x, y) => (x[0] < y[0] ? -1 : 1))

  return (status: number, value: unknown) => {
    try {
      for (const [match, schema] of possibleResponses) {
        const isMatch =
          (/^\d+$/.test(match) && String(status) === match) ||
          (/^\d[xX]{2}$/.test(match) && String(status)[0] === match[0])

        if (isMatch) {
          return schema.parse(value)
        }
      }

      if (defaultResponse) {
        return defaultResponse.parse(value)
      }

      // TODO: throw on unmatched response
      return value
    } catch (err) {
      throw KoaRuntimeError.ResponseError(err)
    }
  }
}
