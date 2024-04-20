import {_GET} from "../../../../../../../../generated/okta.idp.yaml/idp/myaccount/emails/[id]/challenge/[challengeId]/route"

export const GET = _GET(async ({params}, respond, context) => {
  // TODO: implementation
  return respond.withStatus(501).body({message: "not implemented"} as any)
})
