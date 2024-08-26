

import { _GET } from "../../../../../../generated/api.github.com.yaml/orgs/[org]/organization-roles/[role_id]/route";

=======
import { _GET } from "../../../../../../generated/api.github.com.yaml/orgs/[org]/organization-roles/[role_id]/route"
>>>>>>> 0c5d89bf (fix: fixes after rebase)

export const GET = _GET(async ({params}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({message: "not implemented"} as any)
})
=======
>>>>>>> 0c5d89bf (fix: fixes after rebase)
