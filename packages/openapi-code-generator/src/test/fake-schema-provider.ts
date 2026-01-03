import type {ISchemaProvider} from "../core/input"
import type {
  IRModel,
  IRPreprocess,
  IRRef,
  MaybeIRModel,
} from "../core/openapi-types-normalized"
import {getRawNameFromRef, isRef} from "../core/openapi-utils"

export class FakeSchemaProvider implements ISchemaProvider {
  private readonly testRefs: Record<string, IRModel> = {}

  registerTestRef(ref: IRRef, model: IRModel) {
    this.testRefs[ref.$ref] = model
  }

  schema(maybeRef: MaybeIRModel): IRModel {
    if (isRef(maybeRef)) {
      const result = this.testRefs[maybeRef.$ref]

      if (!result) {
        throw new Error(
          `FakeSchemaProvider: $ref '${maybeRef.$ref}' is not registered`,
        )
      }

      return result
    }

    return maybeRef
  }

  allSchemas(): Record<string, MaybeIRModel> {
    return Object.fromEntries(
      Object.entries(this.testRefs).map(([$ref, value]) => {
        return [getRawNameFromRef({$ref}), value]
      }),
    )
  }

  preprocess(): IRPreprocess {
    return {}
  }
}
