import { Observable } from 'rxjs/Observable';
import { SubsctiptionsRegistry } from '../services/SubsctiptionsRegistry';
import { StudioState } from './../services/model';
import { InteropClientFactory } from '../services/InteropClientFactory';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';
import { App, ConsumedService, ProvidedService } from '@plexus-interop/broker';
import 'rxjs/add/operator/concat';

enum ServiceType {
  PROVIDED, CONSUMED
}

interface PlexusStudioService {
  name: string,
  type: ServiceType,
  actions: { name: string }[]
}

@Component({
  selector: 'app-services',
  templateUrl: './app-services.component.html',
  styleUrls: ['./app-services.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class AppServicesComponent implements OnInit {

  constructor(
    private actions: AppActions,
    private router: Router,
    private store: Store<fromRoot.State>,
    private interopClientFactory: InteropClientFactory,
    private subscribtions: SubsctiptionsRegistry) {
  }

  consumedServices: Observable<PlexusStudioService[]> = Observable.of([]);
  providedServices: Observable<PlexusStudioService[]> = Observable.of([]);

  allServices: Observable<PlexusStudioService[]>;
  
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

        return consumed.map(service => ({
          name: service.alias,
          type: ServiceType.CONSUMED,
          actions: service.methods.valuesArray().map(method => ({ name: method.method.name }))
        }));
      });

    this.providedServices = this.store
      .select(state => state.plexus)
      .map(state => {
        if (!state.connectedApp) {
          return [];
        }

        const services = state.services;
        const app = state.connectedApp;
        const provided = services.interopRegistryService.getProvidedServices(app.id);

        return provided.map(service => ({
          name: service.alias,
          type: ServiceType.CONSUMED,
          actions: service.methods.valuesArray().map(method => ({ name: method.method.name }))
        }));
      });
  }

  openComsumed() {
    this.router.navigate(['/consumed']);
  }

  openProvided() {
    this.router.navigate(['/provided']);
  }

}
