import dotenv from "dotenv"

dotenv.config()

import axios from "axios"
import {ApiClient} from "./generated/api.github.com.yaml/client"
import type {t_repository} from "./generated/api.github.com.yaml/models"

const client = new ApiClient({
  axios: axios.create({
    headers: {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`},
  }),
  basePath: "https://api.github.com",
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
    console.info(`updating: ${repo.full_name}`)
    await updateRepoConfig(repo.owner.login, repo.name)
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

async function updateRepoConfig(owner: string, repo: string) {
  await client.reposUpdate({
    owner,
    repo,
    requestBody: {
      allow_auto_merge: true,
      allow_merge_commit: false,
      allow_update_branch: true,
      delete_branch_on_merge: true,
    },
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
