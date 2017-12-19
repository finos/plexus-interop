import { TransportConnection } from '@plexus-interop/transport-common/src/transport/TransportConnection';
import { InteropClient } from '../services/core/InteropClient';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from "../services/ui/app.actions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/ui/root-reducers';
import { Router } from "@angular/router";
import { SubsctiptionsRegistry } from "../services/ui/SubsctiptionsRegistry";
import { InteropRegistryService, ConsumedMethod } from "@plexus-interop/broker";
import { DiscoveredMethod, InvocationRequestInfo } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit, OnDestroy {

  private readonly log: Logger = LoggerFactory.getLogger("ConsumedServiceComponent");

  private registryService: InteropRegistryService;

  private interopClient: InteropClient;
  private discoveredMethods: DiscoveredMethod[];
  private consumedMethod: ConsumedMethod;

  private selectedDiscoveredMethod: DiscoveredMethod;

  messageContent: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
  }

  ngOnInit() {
    this.messageContent = ""
    const consumedMethod$ = this.store
      .filter(state => !!state.plexus.consumedMethod)
      .map(state => state.plexus);

    this.subscriptions.add(
      consumedMethod$.subscribe(state => {
        this.interopClient = state.services.interopClient;
        this.discoveredMethods = state.consumedMethod.discoveredMethods.methods;
        this.interopClient = state.services.interopClient;
        this.registryService = state.services.interopRegistryService;
        this.consumedMethod = state.consumedMethod.method;
        this.createDefaultMessage();
      }));

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  sendRequest() {
    this.log.info("Selected method", this.selectedDiscoveredMethod);
    const handler = {
      value: v => {
        this.log.info(`Response received:  ${this.format(v)}`);
      },
      error: e => {
        this.log.error(`Error received`, e);
      }
    };
    if (!!this.selectedDiscoveredMethod) {

      this.interopClient.sendUnaryRequest(
        this.selectedDiscoveredMethod, this.messageContent, handler)
        .catch(e => {
          this.log.error(`Error received`, e);
        });

    } else {
      this.interopClient.sendUnaryRequest(
        this.consumedMethod, this.messageContent, handler)
        .catch(e => {
          this.log.error(`Error received`, e);
        });
    }

  }

  format(data) {
    return JSON.stringify(JSON.parse(data), null, 2);
  }

  createDefaultMessage() {
    if (this.consumedMethod && this.interopClient) {
      const method = this.consumedMethod.method;
      this.messageContent = this.interopClient.createDefaultPayload(method.inputMessage.id);
      this.formatAndUpdateArea();
    }
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
  }

  toInvocationRequest(discoveredMethod: DiscoveredMethod): InvocationRequestInfo {
    const connectionId = discoveredMethod.providedMethod.providedService.connectionId ?
      UniqueId.fromProperties(discoveredMethod.providedMethod.providedService.connectionId) : null;
    return {
      methodId: discoveredMethod.providedMethod.methodId,
      serviceId: discoveredMethod.providedMethod.providedService.serviceId,
      applicationId: discoveredMethod.providedMethod.providedService.applicationId,
      connectionId
    };
  }
}
