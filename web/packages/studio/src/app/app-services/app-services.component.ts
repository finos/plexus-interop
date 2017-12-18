import { Observable } from 'rxjs/Observable';
import { SubsctiptionsRegistry } from '../services/SubsctiptionsRegistry';
import { StudioState } from './../services/model';
import { InteropClientFactory } from '../services/InteropClientFactory';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';
import { App, ConsumedService, ProvidedService, ConsumedMethod, InteropRegistryService } from '@plexus-interop/broker';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-services',
  templateUrl: './app-services.component.html',
  styleUrls: ['./app-services.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class AppServicesComponent implements OnInit {

  private registryService: InteropRegistryService;

  constructor(
    private store: Store<fromRoot.State>,
    private actions: AppActions,
    private router: Router,
    private interopClientFactory: InteropClientFactory,
    private subscribtions: SubsctiptionsRegistry) {
  }

  consumedServices: Observable<ConsumedService[]> = Observable.of([]);
  providedServices: Observable<ProvidedService[]> = Observable.of([]);
  
  private subscriptions: SubsctiptionsRegistry;

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
