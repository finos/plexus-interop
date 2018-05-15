/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { TransportConnection } from '@plexus-interop/transport-common/src/transport/TransportConnection';
import { InteropClient } from '../services/core/InteropClient';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from '../services/ui/AppActions';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/RootReducers';
import { Router } from '@angular/router';
import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { InteropRegistryService, ConsumedMethod } from '@plexus-interop/broker';
import { DiscoveredMethod, InvocationRequestInfo, MethodType, StreamingInvocationClient, ConsumedService } from '@plexus-interop/client';
import { UniqueId } from '@plexus-interop/protocol';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { createInvocationLogger } from '../services/core/invocation-utils';
import { FormControl } from '@angular/forms';
import { plexusMessageValidator } from '../services/ui/validators';

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubscriptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit, OnDestroy {

  private readonly log: Logger = LoggerFactory.getLogger('ConsumedServiceComponent');

  private registryService: InteropRegistryService;

  private interopClient: InteropClient;
  private discoveredMethods: DiscoveredMethod[];
  private consumedMethod: ConsumedMethod;
  private title: string;

  private selectedDiscoveredMethod: DiscoveredMethod;

  messageContent: string;
  messageContentControl: FormControl = new FormControl('{}');
  responseContent: string = '{}';

  messagesToSend: number = 1;
  messagesPeriodInMillis: number = 200;
  responseCounter: number = 0;

  invocationStarted: number = 0;
  responseTime: number = 0;
  spamStarted: boolean = false;

  requestId: number = 0;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubscriptionsRegistry) {
  }

  ngOnInit() {
    this.messageContent = ''
    const consumedMethod$ = this.store
      .filter(state => !!state.plexus.consumedMethod)
      .map(state => state.plexus);

    this.subscriptions.add(
      consumedMethod$
        .filter(state => !!state.consumedMethod && !!state.services.interopClient)
        .subscribe(state => {
          this.selectedDiscoveredMethod = undefined;
          this.spamStarted = false;
          this.interopClient = state.services.interopClient;
          this.discoveredMethods = state.consumedMethod.discoveredMethods.methods;
          this.interopClient = state.services.interopClient;
          this.registryService = state.services.interopRegistryService;
          this.consumedMethod = state.consumedMethod.method;
          this.title = this.getTitle(this.consumedMethod);
          this.createDefaultMessage();          
          this.messageContentControl.setValidators([
            plexusMessageValidator('messageContentControl', this.interopClient, this.consumedMethod)
          ]);
        }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  getTitle(consumedMethod: ConsumedMethod): string {
    return `Consumed Method - ${consumedMethod.consumedService.service.id}${this.getLabel(consumedMethod.consumedService.service)}.${consumedMethod.method.name}`;
  }

  getLabel(service: ConsumedService): string {
    return !!service.serviceAlias ? `(${service.serviceAlias})` : ''; 
  }

  handleResponse(responseJson: string, logger: Logger) {
    this.responseCounter++;
    this.responseTime = new Date().getTime() - this.invocationStarted;
    this.responseContent += `
    Message number ${this.responseCounter}, received after ${this.responseTime}ms:
    ${responseJson}`;
    logger.info(`Received:\n${responseJson}`);
  }

  handleError(e: any, logger: Logger) {
    logger.error('Error received', e);
  }

  handleCompleted(logger: Logger) {
    logger.info('Invocation completed received');
  }

  handleStreamCompleted(logger: Logger) {
    logger.info('Remote stream completed received');
  }

  resetInvocationInfo() {
    this.responseCounter = 0;
    this.responseContent = '';
    this.responseTime = 0;
    this.invocationStarted = new Date().getTime();
  }

  async discoverMethods() {
    const discovered = await this.interopClient.discoverAllMethods(this.consumedMethod);
    this.store.dispatch({ type: AppActions.DISCOVER_METHODS_SUCCESS, payload: discovered });
  }

  async sendRequest() {

    const method = this.selectedDiscoveredMethod || this.consumedMethod;
    const invocationLogger = createInvocationLogger(this.consumedMethod.method.type, ++this.requestId, this.log, this.selectedDiscoveredMethod);

    const handler = {
      value: v => this.handleResponse(v, invocationLogger),
      error: e => this.handleError(e, invocationLogger)
    };

    const responseObserver = {
      next: r => this.handleResponse(r, invocationLogger),
      error: e => this.handleError(e, invocationLogger),
      complete: () => this.handleCompleted(invocationLogger),
      streamCompleted: () => this.handleStreamCompleted(invocationLogger)
    }

    this.resetInvocationInfo();

    switch (this.consumedMethod.method.type) {
      case MethodType.Unary:
        invocationLogger.info(`Sending:\n${this.messageContent}`);
        this.interopClient.sendUnaryRequest(method, this.messageContent, handler)
          .catch(e => this.handleError(e, invocationLogger));
        break;
      case MethodType.ServerStreaming:
        invocationLogger.info(`Sending:\n${this.messageContent}`);
        this.interopClient.sendServerStreamingRequest(method, this.messageContent, responseObserver);
        break;
      case MethodType.ClientStreaming:
      case MethodType.DuplexStreaming:
        try {
          invocationLogger.info('Starting invocation');
          const client = await this.interopClient.sendBidiStreamingRequest(method, responseObserver);
          this.sendAndSchedule(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis, client, invocationLogger);
        } catch (error) {
          this.handleError(error, invocationLogger);
        }
    }

  }

  startUnarySpam() {
    const delay = 200;
    this.spamStarted = true;
    this.log.info(`Starting Unary Spam with ${delay}ms between messages`);
    const intervalId = setInterval(() => {
      if (!this.spamStarted) {
        clearInterval(intervalId);
      } else {
        this.sendRequest();
      }
    }, delay);
  }

  stopUnarySpam() {
    this.spamStarted = false;
  }

  isUnary() {
    return this.consumedMethod.method.type === MethodType.Unary;
  }

  isClientStreaming() {
    return this.consumedMethod.method.type === MethodType.ClientStreaming || this.consumedMethod.method.type === MethodType.DuplexStreaming;
  }

  isServerStreaming() {
    return this.consumedMethod.method.type === MethodType.ServerStreaming || this.consumedMethod.method.type === MethodType.DuplexStreaming;
  }

  sendAndSchedule(
    message: string,
    leftToSend: number,
    intervalInMillis: number,
    client: StreamingInvocationClient<string>,
    logger: Logger) {

    if (leftToSend > 0) {
      logger.info(`Sending:\n${message}`);
      client.next(message);
      setTimeout(() => {
        this.sendAndSchedule(message, leftToSend - 1, intervalInMillis, client, logger);
      }, intervalInMillis);
    } else {
      logger.info('Sending invocation completion');
      client.complete();
    }
  }

  label(providedMethod: DiscoveredMethod): string {
    const alias = providedMethod.providedMethod.providedService.serviceAlias;
    const aliasPostfix = alias ? ` (${alias})` : '';
    const connectionId = providedMethod.providedMethod.providedService.connectionId;
    const guidPostfix = connectionId && connectionId.hi ? ` - ${UniqueId.fromProperties(connectionId).toString()}` : '';
    return `${providedMethod.providedMethod.providedService.applicationId}${aliasPostfix}${guidPostfix}`
  }

  format(data) {
    return JSON.stringify(JSON.parse(data), null, 2);
  }

  createDefaultMessage() {
    const method = this.consumedMethod.method;
    this.messageContent = this.interopClient.createDefaultPayload(method.requestMessage.id);
    this.formatAndUpdateArea();
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
  }

}
