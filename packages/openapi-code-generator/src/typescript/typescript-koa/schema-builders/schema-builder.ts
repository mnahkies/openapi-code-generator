import { IRParameter, MaybeIRModel } from "../../../core/openapi-types-normalized"
import { ImportBuilder } from "../../common/import-builder"

export interface SchemaBuilder {
  importHelpers(importBuilder: ImportBuilder): void

  fromParameters(parameters: IRParameter[]): string

  fromModel(maybeModel: MaybeIRModel, required: boolean): string
}
