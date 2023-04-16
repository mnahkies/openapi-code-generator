import {Input} from "../../core/input"
import {emitGenerationResult} from "../common/output-utils"
import {TypeBuilder} from "../common/type-builder"
import {TypescriptFetchClientBuilder} from "./typescript-fetch-client-builder"

export async function generateTypescriptFetch({dest, input}: { dest: string, input: Input }): Promise<void> {
  const models = TypeBuilder.fromInput("./models.ts", input)

  const client = new TypescriptFetchClientBuilder(
    "client.ts",
    "ApiClient",
    models,
  )

  input.allOperations()
    .map(it => client.add(it))

  await emitGenerationResult(dest, [
    models,
    client,
  ])
}
