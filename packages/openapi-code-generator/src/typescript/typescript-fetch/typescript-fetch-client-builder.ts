import { TypescriptClientBuilder } from "../common/client-builder"
import { ImportBuilder } from "../common/import-builder"
import { ClientOperationBuilder } from "../common/client-operation-builder"
import { asyncMethod, routeToTemplateString } from "../common/typescript-common"
import { isDefined } from "../../core/utils"

export class TypescriptFetchClientBuilder extends TypescriptClientBuilder {

    protected buildImports(imports: ImportBuilder): void {
        imports
            .from('querystring')
            .all('qs')
    }

    protected buildOperation(builder: ClientOperationBuilder): string {
        const { operationId, route, method } = builder
        const { requestBodyParameter, requestBodyContentType } = builder.requestBodyAsParameter()

        const operationParameter = builder.methodParameter()

        const queryString = builder.queryString()
        const headers = builder.headers()

        const hasAcceptHeader = builder.hasHeader('Accept')

        const returnType = builder.returnType()
            .map(({ statusType, responseType }) => {
                return `Res<${ statusType },${ responseType }>`
            })
            .join(' | ')



        const url = '`' + routeToTemplateString(route) + (queryString ? "?${this._query({" + queryString + "})}" : "") + '`'
        const body = `

const headers: Record<string,string|undefined> = {${
            [
                hasAcceptHeader ? undefined : `'Accept': 'application/json',`,
                requestBodyContentType ? `'Content-Type': '${ requestBodyContentType }',` : undefined,
                headers || undefined,
            ]
                .filter(isDefined)
                .join('\n')
        }}

const res = await fetch(this.config.basePath + ${ url },
    {
    method: "${ method }",
    headers: this._headers(headers),
    ${ requestBodyParameter ? `body: JSON.stringify(p.requestBody),` : '' }
    })

// TODO: this is a poor assumption
return {status: res.status as any, body: (await res.json() as any)};

`

        return asyncMethod({
            name: operationId,
            parameters: [operationParameter],
            returnType,
            body,
        })
    }

    protected buildClient(clientName: string, clientMethods: string[]): string {
        return `
export interface ${ clientName }Config {
  basePath: string
  defaultHeaders: Record<string, string>
}

export interface Res<StatusCode, Body> {
    status: StatusCode,
    body: Body
}

export class ${ clientName } {
  constructor(private readonly config: ${ clientName }Config) {}

  private _query(params: Record<string, string|number|boolean|undefined|null>): string {
    const filtered = Object.fromEntries(
        Object.entries(params)
            .filter(([k,v])=> v !== undefined)
    )

    return qs.stringify(filtered)
  }

  private _headers(headers: Record<string, string|undefined>): Record<string, string> {
    return Object.fromEntries(
        Object.entries({...this.config.defaultHeaders, ...headers})
            .filter((it): it is [string,string] => it[1] !== undefined)
    )
  }

    ${ clientMethods.join('\n') }
}`
    }
}
