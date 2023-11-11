/**
 * @prettier
 */
import {
  bootstrap,
  createRouter,
  FindPetById,
} from "./generated/petstore-expanded.yaml/generated"

const notImplemented = async () => {
  return {
    status: 501 as const,
    body: {code: 1, message: "not implemented"},
  }
}

const findPetById: FindPetById = async ({params}, ctx) => {
  switch (params.id) {
    case 1:
      return {
        status: 200 as const,
        body: {
          id: 1,
          name: "Jake",
          breed: "border-collie",
        },
      }

    case 2:
      return {
        status: 200 as const,
        body: {
          id: 2,
          name: "Lacy",
          breed: "border-collie",
        },
      }

    default:
      return {
        status: 404 as const,
        body: {
          code: 2,
          message: "not found",
        },
      }
  }
}

async function main() {
  const {server, address} = await bootstrap({
    router: createRouter({
      findPets: notImplemented,
      findPetById,
      addPet: notImplemented,
      deletePet: notImplemented,
    }),
    port: {port: 3000, host: "127.0.0.1"},
  })

  console.info(`listening on ${address.address}:${address.port}`)

  process.on("SIGTERM", () => {
    console.info("sigterm received, closing server")
    server.close()
  })
}

if (require.main === module) {
  main().catch((err) => {
    console.error("unhandled exception", err)
    process.exit(1)
  })
}
