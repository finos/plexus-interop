import { Observable } from 'rxjs/Observable';
import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { StudioState } from './../services/ui/model';
import { InteropClientFactory } from '../services/core/InteropClientFactory';
import { AppActions } from '../services/ui/app.actions';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/root-reducers';
import { App, ConsumedService, ProvidedService, ConsumedMethod, InteropRegistryService } from '@plexus-interop/broker';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-services',
  templateUrl: './app-services.component.html',
  styleUrls: ['./app-services.component.css'],
  providers: [SubscriptionsRegistry]
})
export class AppServicesComponent implements OnInit {

  private registryService: InteropRegistryService;

  constructor(
    private store: Store<fromRoot.State>,
    private actions: AppActions,
    private router: Router,
    private interopClientFactory: InteropClientFactory,
    private subscribtions: SubscriptionsRegistry) {
  }

  consumedServices: Observable<ConsumedService[]> = Observable.of([]);
  providedServices: Observable<ProvidedService[]> = Observable.of([]);
  
  private subscriptions: SubscriptionsRegistry;

  public ngOnInit(): void {
    this.consumedServices = this.store
      .select(state => state.plexus)
      .map(state => {
        if (!state.connectedApp) {
          return [];
        }

        const services = state.services;
        const app = state.connectedApp;
        const consumed = services.interopRegistryService.getConsumedServices(app.id);

        return consumed;
      });

    this.providedServices = this.store
      .select(state => state.plexus)
      .map(state => {

        if (!state.connectedApp) {
          return [];
        }

        const services = state.services;
        const app = state.connectedApp;

        return services.interopRegistryService.getProvidedServices(app.id);

      });
  }

  openProvided(method) {
     this.store.dispatch({ type: AppActions.SELECT_PROVIDED_METHOD, payload: method });
     this.router.navigate(['/provided']);
  }

  openConsumed(method: ConsumedMethod) {
      this.store.dispatch({ type: AppActions.SELECT_CONSUMED_METHOD, payload: method });
  }

  getMethodsArray(service: ProvidedService | ConsumedService) {
    return service.methods.valuesArray();
  }

}
