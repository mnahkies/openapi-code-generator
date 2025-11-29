import {Component, signal} from "@angular/core"
import {RouterOutlet} from "@angular/router"
import {GitHubV3RestApiModule} from "../generated/api.github.com.yaml/api.module"
import {ContosoWidgetManagerModule} from "../generated/azure-core-data-plane-service.tsp/api.module"
import {ContosoProviderHubClientModule} from "../generated/azure-resource-manager.tsp/api.module"
import {MyAccountManagementModule} from "../generated/okta.idp.yaml/api.module"
import {OktaOpenIdConnectOAuth20Module} from "../generated/okta.oauth.yaml/api.module"
import {SwaggerPetstoreModule} from "../generated/petstore-expanded.yaml/api.module"
import {StripeApiModule} from "../generated/stripe.yaml/api.module"
import {TodoListsExampleApiModule} from "../generated/todo-lists.yaml/api.module"

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    ContosoProviderHubClientModule,
    ContosoWidgetManagerModule,
    GitHubV3RestApiModule,
    MyAccountManagementModule,
    OktaOpenIdConnectOAuth20Module,
    StripeApiModule,
    SwaggerPetstoreModule,
    TodoListsExampleApiModule,
  ],
  template: `
    <h1>Welcome to {{ title() }}!</h1>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal("typescript-angular")
}
