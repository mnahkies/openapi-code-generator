import {
  type GetResponsesEmpty,
  type GetValidationNumbersRandomNumber,
  type PostValidationEnums,
  createRouter,
} from "../generated/routes/validation"

const postValidationEnums: PostValidationEnums = async ({body}, respond) => {
  return respond.with200().body(body)
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

export function createValidationRouter() {
  return createRouter({
    postValidationEnums,
    getValidationNumbersRandomNumber,
    getResponsesEmpty,
  })
}
