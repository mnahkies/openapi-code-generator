import {SkipResponse} from "@nahkies/typescript-koa-runtime/server"
import {
  createRouter,
  type PostMediaTypesText,
  type PostMediaTypesXWwwFormUrlencoded,
} from "../../generated/server/koa/routes/media-types.ts"

const postMediaTypesText: PostMediaTypesText = async (
  {body},
  _respond,
  ctx,
) => {
  ctx.status = 200
  ctx.body = body

  // TODO: the typescript types are correct, but gets mangled by json serialization
  // return respond.with200().body("Plain text response")

  return SkipResponse
}

const postMediaTypesXWwwFormUrlencoded: PostMediaTypesXWwwFormUrlencoded =
  async ({body}, respond) => {
    return respond.with200().body(body)
  }

export function createMediaTypesRouter() {
  return createRouter({
    postMediaTypesText,
    postMediaTypesXWwwFormUrlencoded,
  })
}
