import {scheduler} from "node:timers/promises"
import {
  createRouter,
  type GetTimeout,
} from "../../generated/server/express/routes/timeout.ts"

const getTimeout: GetTimeout = async ({query}, respond) => {
  await scheduler.wait(query.ms)
  return respond.with200().body({ms: query.ms})
}

export function createTimeoutRouter() {
  return createRouter({
    getTimeout,
  })
}
