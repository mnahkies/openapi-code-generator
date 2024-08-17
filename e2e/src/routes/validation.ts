import {
  type GetValidationNumbersRandomNumber,
  createRouter,
} from "../generated/routes/validation"

const getValidationNumbersRandomNumber: GetValidationNumbersRandomNumber =
  async ({query}, respond) => {
    const max = query.max ?? 10
    const min = query.min ?? 0
    const forbidden = new Set(query.forbidden ?? [])

    const maxAttempts = 10
    for (let i = 0; i < maxAttempts; i++) {
      const result = Math.random() * (max - min) + min

      if (!forbidden.has(result)) {
        return respond.with200().body({
          result,
          params: {
            min,
            max,
            forbidden: Array.from(forbidden),
          },
        })
      }
    }

    return respond.withStatus(404)
  }

export function createValidationRouter() {
  return createRouter({
    getValidationNumbersRandomNumber,
  })
}
