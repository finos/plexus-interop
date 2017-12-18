import { TransportConnection } from '@plexus-interop/transport-common/src/transport/TransportConnection';
import { InteropClient } from '../services/InteropClient';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from "../services/app.actions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/reducers';
import { Router } from "@angular/router";
import { SubsctiptionsRegistry } from "../services/SubsctiptionsRegistry";
import { InteropRegistryService } from "@plexus-interop/broker";
import { DiscoveredMethod } from "@plexus-interop/client";

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit, OnDestroy {

  private registryService: InteropRegistryService;
  private interopClient: InteropClient;
  private discoveredMethods: DiscoveredMethod[];
  private connection: TransportConnection;

  messageContent: string;
  messageContentString = `{
    "build-client": "cd ./packages/client && yarn build",
    "build-common": "cd ./packages/common && yarn build ",
    "build-e2e": "cd ./packages/e2e && yarn build",
    "build-web-example": "cd ./packages/web-example && yarn build",
    "build-electron-launcher": "cd ./packages/electron-launcher && yarn build",
    "build-protocol": "cd ./packages/protocol && yarn build",
    "build-transport-common": "cd ./packages/transport-common && yarn build",
    "build-websocket-transport": "cd ./packages/websocket-transport && yarn build",
    "build-quickstart-viewer": "cd ./packages/ccy-pair-rate-viewer && yarn build",
    "build-quickstart-provider": "cd ./packages/ccy-pair-rate-provider && yarn build",
    "build-core": "run-s build-common build-transport-common build-websocket-transport build-client",
    "build-all-win": "run-s build-all benchmarks e2e",
    "prebuild-all": "yarn install",
    "e2e": "cd ./packages/e2e && yarn electron-e2e",
    "poste2e": "yarn coverage",
    "coverage": "nyc report --reporter=text --reporter=html",
    "benchmarks": "cd ./packages/e2e && yarn electron-e2e-benchmarks"
  }`;
  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
  }

  ngOnInit() {
    const state$ = this.store
      .filter(state => !!state.plexus.consumedMethod)
      .map(state => state.plexus);

    this.subscriptions.add(
      state$.subscribe(state => {
        this.discoveredMethods = state.consumedMethod.discoveredMethods.methods;
        this.interopClient = state.services.interopClient;

        state.services.сonnectionProvider().then(connection => {
          this.connection = connection;
        })
      }));

    this.messageContent = this.messageContentString;
    this.formatAndUpdateArea();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }


  format(messageStr) {
    return JSON.stringify(JSON.parse(messageStr), null, 2);
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
  }

  invoke(method: DiscoveredMethod) {
    this.interopClient.sendUnaryRequest({
      serviceAlias: method.providedMethod.providedService.serviceAlias,
      serviceId: method.providedMethod.providedService.serviceId,
      methodId: method.providedMethod.methodId,
      applicationId: method.providedMethod.providedService.applicationId,
      connectionId: this.connection.uuid()
    }, "xxx", {
        value: console.info,
        error: console.error
      });
  }
}
