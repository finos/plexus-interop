/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TransportConnection } from '@plexus-interop/transport-common/src/transport/TransportConnection';
import { InteropClient } from '../services/core/InteropClient';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from "../services/ui/AppActions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/ui/RootReducers';
import { Router } from "@angular/router";
import { SubscriptionsRegistry } from "../services/ui/SubscriptionsRegistry";
import { InteropRegistryService, ConsumedMethod } from "@plexus-interop/broker";
import { DiscoveredMethod, InvocationRequestInfo, MethodType, StreamingInvocationClient } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubscriptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit, OnDestroy {

  private readonly log: Logger = LoggerFactory.getLogger("ConsumedServiceComponent");

  private registryService: InteropRegistryService;

  private interopClient: InteropClient;
  private discoveredMethods: DiscoveredMethod[];
  private consumedMethod: ConsumedMethod;

  private selectedDiscoveredMethod: DiscoveredMethod;

  messageContent: string;
  responseContent: string;

  messagesToSend: number = 1;
  messagesPeriodInMillis: number = 200;
  responseCounter: number = 0;

  invocationStarted: number = 0;
  responseTime: number = 0;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubscriptionsRegistry) {
  }

  ngOnInit() {
    this.messageContent = ""
    const consumedMethod$ = this.store
      .filter(state => !!state.plexus.consumedMethod)
      .map(state => state.plexus);

    this.subscriptions.add(
      consumedMethod$.subscribe(state => {
        this.selectedDiscoveredMethod = undefined;
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

  handleResponse(responseJson: string) {
    this.responseCounter++;
    this.responseTime = new Date().getTime() - this.invocationStarted;
    this.responseContent += `
    Message number ${this.responseCounter}, received after ${this.responseTime}ms:
    ${responseJson}`;
  }

  handleError(e: any) {
    this.log.error(`Error received`, e);
  }

  handleCompleted() {
    this.log.info("Invocation completed received");
  }

  resetInvocationInfo() {
    this.responseCounter = 0;
    this.responseContent = "";
    this.responseTime = 0;
    this.invocationStarted = new Date().getTime();
  }

  async sendRequest() {

    const handler = {
      value: v => this.handleResponse(v),
      error: e => this.handleError(e)
    };

    const responseObserver = {
      next: r => this.handleResponse(r),
      error: e => this.handleError(e),
      complete: () => this.handleCompleted()
    }

    const method = this.selectedDiscoveredMethod || this.consumedMethod;

    this.resetInvocationInfo();

    switch (this.consumedMethod.method.type) {
      case MethodType.Unary:
        this.interopClient.sendUnaryRequest(method, this.messageContent, handler)
          .catch(e => this.handleError(e));
        break;
      case MethodType.ServerStreaming:
        this.interopClient.sendServerStreamingRequest(method, this.messageContent, responseObserver);
        break;
      case MethodType.ClientStreaming:
      case MethodType.DuplexStreaming:
        try {
          const client = await this.interopClient.sendBidiStreamingRequest(method, responseObserver);
          this.sendAndSchedule(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis, client);
        } catch (error) {
          this.handleError(error);
        }
    }
    
  }

  isClientStreaming() {
    return this.consumedMethod.method.type === MethodType.ClientStreaming || this.consumedMethod.method.type === MethodType.DuplexStreaming;
  }

  isServerStreaming() {
    return this.consumedMethod.method.type === MethodType.ServerStreaming || this.consumedMethod.method.type === MethodType.DuplexStreaming;
  }

  sendAndSchedule(message: string, leftToSend: number, intervalInMillis: number, client: StreamingInvocationClient<string>) {
    if (leftToSend > 0) {
      client.next(message);
      setTimeout(() => {
        this.sendAndSchedule(message, leftToSend - 1, intervalInMillis, client);
      }, intervalInMillis);
    } else {
      this.log.info("Sending invocation completion");
      client.complete();
    }
  }

  label(providedMethod: DiscoveredMethod): string {
    const connectionId = providedMethod.providedMethod.providedService.connectionId;
    const guidPostfix = connectionId && connectionId.hi ? ` - ${UniqueId.fromProperties(connectionId).toString()}` : "";
    return `${providedMethod.providedMethod.providedService.applicationId}${guidPostfix}`
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

}
