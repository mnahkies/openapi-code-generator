import {SkipResponse} from "@nahkies/typescript-express-runtime/server"
import {
  createRouter,
  type GetEscapeHatchesPlainText,
} from "../../generated/server/express/routes/escape-hatches"

const getEscapeHatchesPlainText: GetEscapeHatchesPlainText = async (
  _,
  _respond,
  _req,
  res,
) => {
  res.setHeader("x-ratelimit-remaining", "100")
  res.status(200).send("Plain text response")

  // TODO: the typescript types are correct, but gets mangled by json serialization
  // return respond.with200().body("Plain text response")

  return SkipResponse
}

export function createEscapeHatchesRouter() {
  return createRouter({
    getEscapeHatchesPlainText,
  })
}
