import {TypeBuilder} from "../common/type-builder"
import {Input} from "../../core/input"
import {emitGenerationResult} from "../common/output-utils"
import {AngularModuleBuilder} from "./angular-module-builder"
import {AngularServiceBuilder} from "./angular-service-builder"

export async function generateTypescriptAngular({dest, input}: { dest: string, input: Input }): Promise<void> {
  const models = TypeBuilder.fromInput("./models.ts", input)

  const client = new AngularServiceBuilder(
    "client.service.ts",
    "ApiClient",
    models,
  )

  input.allOperations()
    .map(it => client.add(it))

  const module = new AngularModuleBuilder(
    "api.module.ts",
    "Api",
  )

  module.provides("./" + client.filename)
    .add(client.name)

  await emitGenerationResult(dest, [
    models,
    client,
    module,
  ])
}
