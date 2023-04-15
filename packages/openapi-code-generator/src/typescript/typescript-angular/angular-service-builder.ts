import {TypescriptClientBuilder} from "../common/client-builder"
import {ImportBuilder} from "../common/import-builder"
import {ClientOperationBuilder} from "../common/client-operation-builder"
import {buildMethod, routeToTemplateString} from "../common/typescript-common"

export class AngularServiceBuilder extends TypescriptClientBuilder {

  protected buildImports(imports: ImportBuilder): void {
    imports
      .from("@angular/core")
      .add("Injectable")

    imports
      .from("@angular/common/http")
      .add(
        "HttpClient",
        "HttpHeaders",
        "HttpParams",
      )

    imports.from("rxjs")
      .add("Observable")
  }

  protected buildOperation(builder: ClientOperationBuilder): string {
    const {operationId, route, method} = builder
    const {requestBodyParameter} = builder.requestBodyAsParameter()

    const operationParameter = builder.methodParameter()

    const queryString = builder.queryString()
    const headers = builder.headers()

    const returnType = builder.returnType()
      .map(({responseType}) => {
        return `${responseType}`
      })
      .join(" | ")

    const url = routeToTemplateString(route)

    const body = `
    ${
        [
            headers ? `const headers = this._headers(${headers})` : "",
            queryString ? `const params = this._queryParams({${queryString}})` : "",
            requestBodyParameter ? `const body = ${builder.paramName(requestBodyParameter.name)}` : "",
        ]
            .filter(Boolean)
            .join("\n")
    }

return this.httpClient.request<any>(
  "${method}",
  this.config.basePath + \`${url}\`, {
    ${
        [
            queryString ? "params," : "",
            headers ? "headers," : "",
            requestBodyParameter ? "body," : ""
        ]
            .filter(Boolean)
            .join("\n")
    }
    observe: 'body',
    reportProgress: false,
  });
`

    return buildMethod({
      name: operationId,
      parameters: [operationParameter],
      returnType: `Observable<${returnType}>`,
      body,
    })
  }

  protected buildClient(clientName: string, clientMethods: string[]): string {
    return `
export class ${clientName}Config {
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
export class ${clientName} {
  constructor(
      private readonly httpClient: HttpClient,
      private readonly config: ${clientName}Config,
  ) {}

  private _headers(headers: Record<string, string|undefined>): Record<string, string> {
    return Object.fromEntries(
        Object.entries({...this.config.defaultHeaders, ...headers})
            .filter((it): it is [string,string] => it[1] !== undefined)
    )
  }

  private _queryParams(queryParams: Record<string, boolean | number | string | string[] | undefined | null>): HttpParams {
    const result = new HttpParams();
    Object.entries(queryParams).forEach(([name, value]) => {
        if(value !== undefined && value !== null){
            result.set(name, String(value));
        }
    })
    return result
  }

  ${clientMethods.join("\n")}
}`
  }
}
