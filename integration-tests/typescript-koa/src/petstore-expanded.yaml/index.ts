import { bootstrap, FindPetById } from "./generated"

const notImplemented = async () => {
  return {
    status: 501 as const,
    body: { code: 1, message: "not implemented" },
  }
}

const findPetById: FindPetById = async ({ params }, ctx) => {
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

bootstrap(
  {
    findPets: notImplemented,
    findPetById,
    addPet: notImplemented,
    deletePet: notImplemented,
  },
  { port: 3000 }
)
