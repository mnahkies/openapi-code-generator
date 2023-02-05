import { IRParameter, MaybeIRModel } from "../../../core/openapi-types-normalized"

export interface SchemaBuilder {
  staticHelpers(): string

  fromParameters(parameters: IRParameter[]): string

  fromModel(maybeModel: MaybeIRModel, required: boolean): string
}
