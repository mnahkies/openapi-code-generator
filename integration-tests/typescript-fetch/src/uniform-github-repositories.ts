import dotenv from "dotenv"

dotenv.config()

import {ApiClient} from "./generated/api.github.com.yaml/client"
import type {t_repository} from "./generated/api.github.com.yaml/models"

const {writeHeapSnapshot} = require("node:v8")

const client = new ApiClient({
  basePath: "https://api.github.com",
  defaultHeaders: {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`},
  defaultTimeout: 5_000,
})

async function main() {
  console.info(client)
  writeHeapSnapshot()
  await checkAuth()

  const repos = await getAllRepos()

  const sourceAndAdminRepos = repos.filter(
    (it) => !it.fork && it.permissions?.admin && !it.archived,
  )

  for (const repo of sourceAndAdminRepos) {
    console.info(`updating: ${repo.full_name}`)
    await updateRepoConfig(repo.owner.login, repo.name)
  }

  if (Reflect.has(global, "gc")) {
    // @ts-expect-error
    global.gc()
  }

  setTimeout(() => {
    writeHeapSnapshot()
  }, 10000)
}

async function checkAuth() {
  const res = await client.usersGetAuthenticated()

  if (res.status !== 200) {
    console.info(res)
    throw new Error("invalid auth!")
  }
}

async function getAllRepos(page = 1): Promise<t_repository[]> {
  const perPage = 100
  const res = await client.reposListForAuthenticatedUser({perPage, page})

  if (res.status !== 200) {
    console.info(res)
    throw new Error(`failed to fetch repositories, page: ${page}`)
  }

  const body = await res.json()

  if (body.length >= perPage) {
    return body.concat(await getAllRepos(page + 1))
  }

  return body
}

async function updateRepoConfig(owner: string, repo: string) {
  const res = await client.reposUpdate({
    owner,
    repo,
    requestBody: {
      allow_auto_merge: true,
      allow_merge_commit: false,
      allow_update_branch: true,
      delete_branch_on_merge: true,
    },
  })

  if (res.status >= 300) {
    console.info(res)
  }
}

main()
