import dotenv from "dotenv"

dotenv.config()

import axios, {type AxiosResponse, isAxiosError} from "axios"
import {
  ApiClient,
  GitHubV3RestApiServers,
} from "./generated/api.github.com.yaml/client.ts"
import type {t_repository} from "./generated/api.github.com.yaml/models.ts"

const client = new ApiClient({
  axios: axios.create({
    headers: {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`},
  }),
  basePath: GitHubV3RestApiServers.default(),
  defaultTimeout: 5_000,
})

async function main() {
  console.info(client)
  await checkAuth()

  const repos = await getAllRepos()

  const sourceAndAdminRepos = repos.filter(
    (it) => !it.fork && it.permissions?.admin && !it.archived,
  )

  for (const repo of sourceAndAdminRepos) {
    console.info(`auditing: ${repo.full_name}`)
    await auditRepository(repo).catch((err) => {
      if (isAxiosError(err)) {
        console.warn("failed to audit", err.response?.data)
      }
    })
  }
}

async function checkAuth() {
  await client.usersGetAuthenticated()
}

async function getAllRepos(page = 1): Promise<t_repository[]> {
  const perPage = 100
  const {data: repos} = await client.reposListForAuthenticatedUser({
    perPage,
    page,
  })

  if (repos.length >= perPage) {
    return repos.concat(await getAllRepos(page + 1))
  }

  return repos
}

async function auditRepository(repo: t_repository) {
  const defaultBranchProtection = await client
    .reposGetBranchProtection({
      owner: repo.owner.login,
      repo: repo.name,
      branch: repo.default_branch,
    })
    .then(takeData)
    .catch(coerce404ToNull)
  const codeOwnerErrors = await client
    .reposCodeownersErrors({owner: repo.owner.login, repo: repo.name})
    .then(takeData)
    .catch(coerce404ToNull)

  console.info(`${repo.owner.login}/${repo.name}
-----------------------------------
main branch protected: ${defaultBranchProtection?.enabled},
admins can bypass: ${!defaultBranchProtection?.enforce_admins},
require reviews: ${defaultBranchProtection?.required_pull_request_reviews},
codeowner errors: ${codeOwnerErrors?.errors.length ?? "none"}
-----------------------------------`)
}

function takeData<T>(res: AxiosResponse<T>) {
  return res.data
}

function coerce404ToNull(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 404) {
    return null
  }
  throw err
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
