

import { _GET, _POST } from "../../../../../../generated/okta.oauth.yaml/oauth2/[authorizationServerId]/v1/logout/route";

=======
import {
_GET,
_POST,
} from "../../../../../../generated/okta.oauth.yaml/oauth2/[authorizationServerId]/v1/logout/route"
>>>>>>> 0c5d89bf (fix: fixes after rebase)

export const GET = _GET(async ({params,query}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({params,body}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({ message: "not implemented" } as any)
})
