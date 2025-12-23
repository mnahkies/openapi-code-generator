import {SkipResponse} from "@nahkies/typescript-express-runtime/server"
import {
  createRouter,
  type PostMediaTypesOctetStream,
  type PostMediaTypesText,
  type PostMediaTypesXWwwFormUrlencoded,
} from "../../generated/server/express/routes/media-types.ts"

const postMediaTypesText: PostMediaTypesText = async (
  {body},
  _respond,
  _req,
  res,
) => {
  res.status(200).send(body)
  // TODO: the typescript types are correct, but gets mangled by json serialization
  // return respond.with200().body("Plain text response")

  return SkipResponse
}

const postMediaTypesXWwwFormUrlencoded: PostMediaTypesXWwwFormUrlencoded =
  async ({body}, respond) => {
    return respond.with200().body(body)
  }

const postMediaTypesOctetStream: PostMediaTypesOctetStream = async (
  {body},
  respond,
) => {
  return respond.with200().body(body)
}

export function createMediaTypesRouter() {
  return createRouter({
    postMediaTypesText,
    postMediaTypesXWwwFormUrlencoded,
    postMediaTypesOctetStream,
  })
}
