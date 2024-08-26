

<<<<<<< HEAD:integration-tests/typescript-nextjs/src/app/api.github.com.yaml/orgs/[org]/organization-fine-grained-permissions/route.ts
import {_GET} from "../../../../../generated/api.github.com.yaml/orgs/[org]/organization-fine-grained-permissions/route"
import { _GET } from "../../../../generated/api.github.com.yaml/user/[account_id]/route";

=======
import { _GET } from "../../../../generated/api.github.com.yaml/user/[account_id]/route"
>>>>>>> 0c5d89bf (fix: fixes after rebase):integration-tests/typescript-nextjs/src/app/api.github.com.yaml/user/[account_id]/route.ts

export const GET = _GET(async ({params}, respond, context) => {
// TODO: implementation
return respond.withStatus(501).body({message: "not implemented"} as any)
})
