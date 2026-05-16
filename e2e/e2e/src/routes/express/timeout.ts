import {
  createRouter,
  type GetTimeout,
} from "../../generated/server/express/routes/timeout.ts"

const getTimeout: GetTimeout = async ({query}, respond) => {
  await new Promise((resolve) => setTimeout(resolve, query.ms))
  return respond.with200().body({ms: query.ms})
}

export function createTimeoutRouter() {
  return createRouter({
    getTimeout,
  })
}
