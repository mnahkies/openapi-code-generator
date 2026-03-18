import {
  createRouter,
  type GetResponses500,
  type GetResponsesDefault,
  type GetResponsesEmpty,
  type GetValidationNumbersRandomNumber,
  type PostValidationEnums,
  type PostValidationOptionalBody,
} from "../../generated/server/express/routes/validation.ts"

const postValidationEnums: PostValidationEnums = async ({body}, respond) => {
  return respond.with200().body(body)
}

const postValidationOptionalBody: PostValidationOptionalBody = async (
  {body},
  respond,
) => {
  if (body) {
    return respond.with200().body(body)
  } else {
    return respond.with204()
  }
}

const getValidationNumbersRandomNumber: GetValidationNumbersRandomNumber =
  async ({query}, respond) => {
    const max = query.max ?? 10
    const min = query.min ?? 0
    const forbidden = new Set(query.forbidden ?? [])

    const maxAttempts = 10
    for (let i = 0; i < maxAttempts; i++) {
      const result = Math.random() * (max - min) + min

      if (!forbidden.has(result)) {
        const response = {
          result,
          params: {
            min,
            max,
            forbidden: Array.from(forbidden),
          },
        }
        return respond.with200().body(response)
      }
    }

    return respond.withStatus(404)
  }

const getResponsesEmpty: GetResponsesEmpty = async (_, respond) => {
  return respond.with204()
}

const getResponsesDefault: GetResponsesDefault = async ({query}, respond) => {
  const status = query.status ?? "200"
  if (status === "200") {
    return respond.with200().body({id: "123"})
  } else if (status === "500") {
    return respond.withDefault(500).body({error: "something went wrong"})
  }

  throw new Error("unreachable")
}

const getResponses500: GetResponses500 = async () => {
  throw new Error("something went wrong")
}

export function createValidationRouter() {
  return createRouter({
    postValidationEnums,
    postValidationOptionalBody,
    getValidationNumbersRandomNumber,
    getResponsesEmpty,
    getResponsesDefault,
    getResponses500,
  })
}
