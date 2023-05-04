import {NgModule} from "@angular/core"
import {BrowserModule} from "@angular/platform-browser"

import {AppRoutingModule} from "./app-routing.module"
import {AppComponent} from "./app.component"
import {ApiModule as GhApiModule} from "./api.github.com.yaml/api.module"
import {ApiModule as PetStoreApiModule} from "./petstore-expanded.yaml/api.module"
import {ApiModule as StripeApiModule} from "./stripe.yaml/api.module"
import {ApiModule as TodoListsApiModule} from "./todo-lists.yaml/api.module"

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
