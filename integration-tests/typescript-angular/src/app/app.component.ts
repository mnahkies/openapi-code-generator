import {Component} from '@angular/core'
import {CommonModule} from '@angular/common'
import {RouterOutlet} from '@angular/router'
import {ApiModule as GhApiModule} from '../generated/api.github.com.yaml/api.module'
import {ApiModule as PetStoreApiModule} from '../generated/petstore-expanded.yaml/api.module'
import {ApiModule as StripeApiModule} from '../generated/stripe.yaml/api.module'
import {ApiModule as TodoListsApiModule} from '../generated/todo-lists.yaml/api.module'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    GhApiModule,
    PetStoreApiModule,
    StripeApiModule,
    TodoListsApiModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'typescript-angular'
}
