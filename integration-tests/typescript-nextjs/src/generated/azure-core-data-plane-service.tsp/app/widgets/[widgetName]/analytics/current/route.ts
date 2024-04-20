import {
  _GET,
  _PATCH,
} from "../../../../../generated/widgets/[widgetName]/analytics/current/route"

export const GET = _GET(async ({ params, query }, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({ message: "not implemented" } as any)
})
export const PATCH = _PATCH(
  async ({ params, query, body }, respond, context) => {
    // TODO: implementation
    return respond.withStatus(501).body({ message: "not implemented" } as any)
  },
)
