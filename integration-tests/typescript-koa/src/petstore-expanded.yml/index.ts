import { bootstrap, FindPetById } from "./generated"

const notImplemented = async () => {
  return { status: 501, body: { error: 'not implemented' } }
}

const findPetById: FindPetById = async ({params}, ctx) => {
  switch (params.id) {
    case 1:
      return {
        status: 200,
        body: {
          name: "Jake",
          breed: "border-collie",
        },
      }

    case 2:
      return {
        status: 200,
        body: {
          name: "Lacy",
          breed: "border-collie",
        },
      }

    default:
      return {
        status: 404,
        body: {
          error: 'not found',
        },
      }
  }
}

bootstrap({
  findPets: notImplemented,
  findPetById,
  addPet: notImplemented,
  deletePet: notImplemented,
}, { port: 3000 })
