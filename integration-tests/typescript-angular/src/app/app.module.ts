import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"

import {AppRoutingModule} from "./app-routing.module"
import {AppComponent} from "./app.component"
import {ApiModule as GhApiModule} from "../generated/api.github.com.yaml/api.module"
import {ApiModule as PetStoreApiModule} from "../generated/petstore-expanded.yaml/api.module"
import {ApiModule as StripeApiModule} from "../generated/stripe.yaml/api.module"
import {ApiModule as TodoListsApiModule} from "../generated/todo-lists.yaml/api.module"

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GhApiModule,
    PetStoreApiModule,
    StripeApiModule,
    TodoListsApiModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
