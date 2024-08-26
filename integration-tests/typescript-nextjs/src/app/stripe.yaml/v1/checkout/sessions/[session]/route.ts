

import { _GET, _POST } from "../../../../../../generated/stripe.yaml/v1/checkout/sessions/[session]/route";

=======
import {
_GET,
_POST,
} from "../../../../../../generated/stripe.yaml/v1/checkout/sessions/[session]/route"
>>>>>>> 0c5d89bf (fix: fixes after rebase)

export const GET = _GET(async ({params,query,body}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({message: "not implemented"} as any)
})
export const POST = _POST(async ({params,body}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({ message: "not implemented" } as any)
})
