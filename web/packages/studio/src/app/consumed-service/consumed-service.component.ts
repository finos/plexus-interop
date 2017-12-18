import { Component, OnInit } from '@angular/core';
import { AppActions } from "../services/app.actions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/reducers';
import { Router } from "@angular/router";
import { SubsctiptionsRegistry } from "../services/SubsctiptionsRegistry";
import { InteropRegistryService } from "@plexus-interop/broker";
import { DiscoveredMethod, InvocationRequestInfo } from "@plexus-interop/client";
import { InteropClient } from "../services/InteropClient";
import { UniqueId } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit {

  private readonly log: Logger = LoggerFactory.getLogger("ConsumedServiceComponent");

  private registryService: InteropRegistryService;

  private interopClient: InteropClient;

  private discoveredMethods: DiscoveredMethod[];

  private selectedDiscoveredMethod: DiscoveredMethod;

  messageContent: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
  }

  ngOnInit() {
    this.messageContent = "";
    const consumedMethod$ = this.store
      .filter(state => !!state.plexus.consumedMethod)
      .map(state => state.plexus);
    this.subscriptions.add(
      consumedMethod$.subscribe(state => {
        this.interopClient = state.services.interopClient;
        this.discoveredMethods = state.consumedMethod.discoveredMethods.methods;
      }));

  }

  sendRequest() {
    this.interopClient.sendUnaryRequest(
      this.toInvocationRequest(this.selectedDiscoveredMethod), this.messageContent, {
        value: v => {
          this.log.info(`Response received, ${v}`);
        },
        error: e => {
          this.log.error(`Error received`, e);
        }
      });
  }

  format(messageStr) {
    return JSON.stringify(JSON.parse(messageStr), null, 2);
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
    console.info(this.messageContent);
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
