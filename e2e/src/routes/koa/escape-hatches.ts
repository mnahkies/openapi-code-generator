import {SkipResponse} from "@nahkies/typescript-koa-runtime/server"
import {
  createRouter,
  type GetEscapeHatchesPlainText,
} from "../../generated/server/koa/routes/escape-hatches"

const getEscapeHatchesPlainText: GetEscapeHatchesPlainText = async (
  _,
  _respond,
  ctx,
) => {
  ctx.set("x-ratelimit-remaining", "100")

  ctx.status = 200
  ctx.body = "Plain text response"

  // TODO: the typescript types are correct, but gets mangled by json serialization
  // return respond.with200().body("Plain text response")

  return SkipResponse
}

export function createEscapeHatchesRouter() {
  return createRouter({
    getEscapeHatchesPlainText,
  })
}
