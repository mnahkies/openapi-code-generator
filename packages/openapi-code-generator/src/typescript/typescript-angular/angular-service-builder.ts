import { TypescriptClientBuilder } from "../common/client-builder"
import { ImportBuilder } from "../common/import-builder"
import { ClientOperationBuilder } from "../common/client-operation-builder"
import { buildMethod, routeToTemplateString } from "../common/typescript-common"
import { isDefined } from "../../core/utils"

export class AngularServiceBuilder extends TypescriptClientBuilder {

  protected buildImports(imports: ImportBuilder): void {
    imports
      .from('@angular/core')
      .add('Injectable')

    imports
      .from('@angular/common/http')
      .add(
        'HttpClient',
        'HttpHeaders',
        'HttpParams',
      )

    imports.from('rxjs')
      .add('Observable')
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const { operationId, route, method } = builder
    const { requestBodyParameter, requestBodyContentType } = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

    const hasAcceptHeader = builder.hasHeader('Accept')

    const returnType = builder.returnType()
      .map(({ responseType }) => {
        return `${ responseType }`
      })
      .join(' | ')

    const url = routeToTemplateString(route)

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

const queryParameters = {${ queryString }};

return this.httpClient.request<any>(
  "${ method }",
  this.config.basePath + \`${ url }\`, {
    params: this.queryParams(queryParameters),
    headers: this.headers(headers),
    ${ requestBodyParameter ? `body: ${ builder.paramName(requestBodyParameter.name) },` : '' }
    observe: 'body',
    reportProgress: false,
  });
`

    return buildMethod({
      name: operationId,
      parameters: [operationParameter],
      returnType: `Observable<${ returnType }>`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    return `
export class ${ clientName }Config {
  basePath: string = ''
  defaultHeaders: Record<string, string> = {}
}

export interface Res<StatusCode, Body> {
    status: StatusCode,
    body: Body
}

@Injectable({
  providedIn: 'root'
})
export class ${ clientName } {
  constructor(
      private readonly httpClient: HttpClient,
      private readonly config: ${ clientName }Config,
  ) {}

  private headers(headers: Record<string, string|undefined>): Record<string, string> {
    return Object.fromEntries(
        Object.entries({...this.config.defaultHeaders, ...headers})
            .filter((it): it is [string,string] => it[1] !== undefined)
    )
  }

  private queryParams(queryParams: Record<string, boolean | number | string | string[] | undefined | null>): HttpParams {
    const result = new HttpParams();
    Object.entries(queryParams).forEach(([name, value]) => {
        if(value !== undefined && value !== null){
            result.set(name, String(value));
        }
    })
    return result
  }

  ${ clientMethods.join('\n') }
}`
  }
}
