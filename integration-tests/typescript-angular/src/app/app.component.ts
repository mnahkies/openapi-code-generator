import {CommonModule} from "@angular/common"
import {Component} from "@angular/core"
import {RouterOutlet} from "@angular/router"
import {ApiModule as GhApiModule} from "../generated/api.github.com.yaml/api.module"
import {ApiModule as AzureCoreDataPlanServiceModule} from "../generated/azure-core-data-plane-service.tsp/api.module"
import {ApiModule as AzureResourceManagerModule} from "../generated/azure-resource-manager.tsp/api.module"
import {ApiModule as OktaIdpModule} from "../generated/okta.idp.yaml/api.module"
import {ApiModule as OktaOauthModule} from "../generated/okta.oauth.yaml/api.module"
import {ApiModule as PetStoreApiModule} from "../generated/petstore-expanded.yaml/api.module"
import {ApiModule as StripeApiModule} from "../generated/stripe.yaml/api.module"
import {ApiModule as TodoListsApiModule} from "../generated/todo-lists.yaml/api.module"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AzureCoreDataPlanServiceModule,
    AzureResourceManagerModule,
    GhApiModule,
    OktaIdpModule,
    OktaOauthModule,
    PetStoreApiModule,
    StripeApiModule,
    TodoListsApiModule,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "typescript-angular"
}
