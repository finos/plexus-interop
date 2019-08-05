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
import { InteropClient } from '../services/core/InteropClient';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from '../services/ui/AppActions';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/RootReducers';
import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { ConsumedMethod } from '@plexus-interop/metadata';
import { DiscoveredMethod, MethodType, StreamingInvocationClient, ConsumedService, InvocationClient } from '@plexus-interop/client';
import { UniqueId } from '@plexus-interop/protocol';
import { Logger, LoggerFactory, pop, uniqueId } from '@plexus-interop/common';
import { createInvocationLogger } from '../services/core/invocation-utils';
import { FormControl } from '@angular/forms';
import { plexusMessageValidator } from '../services/ui/validators';

type InvocationProfile = {
  id: string,
  client: InvocationClient,
  logger: Logger,
  started: number
};

@Component({
  selector: 'app-consumed-service',
  templateUrl: './consumed-service.component.html',
  styleUrls: ['./consumed-service.component.css'],
  providers: [SubscriptionsRegistry]
})
export class ConsumedServiceComponent implements OnInit, OnDestroy {

  private readonly log: Logger = LoggerFactory.getLogger('ConsumedServiceComponent');

  private interopClient: InteropClient;
  public discoveredMethods: DiscoveredMethod[];
  private consumedMethod: ConsumedMethod;
  public title: string;

  private activeInvocationsMap: Map<string, InvocationProfile> = new Map();
  private selectedDiscoveredMethod: DiscoveredMethod;

  messageContent: string;
  messageContentControl: FormControl = new FormControl('{}');

  messagesToSend: number = 1;
  messagesPeriodInMillis: number = 200;

  constructor(
    private store: Store<fromRoot.State>,
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
          this.interopClient = state.services.interopClient;
          this.discoveredMethods = state.consumedMethod.discoveredMethods.methods;
          this.interopClient = state.services.interopClient;
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

  handleResponse(responseJson: string, logger: Logger, started: number) {
    logger.info(
      `Message received after ${new Date().getTime() - started}ms:
      ${responseJson}`);
  }

  handleError(e: any, logger: Logger, invocationId: string) {
    logger.error('Error received', e);
    this.clearInvocationProfile(invocationId);
  }

  handleCompleted(logger: Logger, invocationId: string) {
    logger.info('Invocation completed received');
    this.clearInvocationProfile(invocationId);
  }

  handleStreamCompleted(logger: Logger) {
    logger.info('Remote stream completed received');
  }

  private clearInvocationProfile(invocationId: string) {
    const profile = this.activeInvocationsMap.get(invocationId);
    if (profile) {
      profile.logger.info('Invocation profile cleared');
      this.activeInvocationsMap.delete(invocationId);
    }
  }

  async discoverMethods() {
    const discovered = await this.interopClient.discoverAllMethods(this.consumedMethod);
    this.store.dispatch({ type: AppActions.DISCOVER_METHODS_SUCCESS, payload: discovered });
  }

  payloadPreview() {
    if ((!this.selectedDiscoveredMethod && !this.consumedMethod) || !this.interopClient) {
      return "";
    }
    const messageId = this.selectedDiscoveredMethod ? this.selectedDiscoveredMethod.inputMessageId : this.consumedMethod.method.requestMessage.id;
    return this.interopClient.createPayloadPreview(messageId, this.messageContent);
  }

  async sendRequest() {

    const method = this.selectedDiscoveredMethod || this.consumedMethod;

    const invocationId = uniqueId();
    const invocationLogger = createInvocationLogger(this.consumedMethod.method.type, invocationId, this.log, this.selectedDiscoveredMethod);

    invocationLogger.info(`Request JSON payload: ${this.messageContent}`);
    invocationLogger.info(`Request binary payload: ${this.payloadPreview()}`);

    const started = new Date().getTime();

    const handler = {
      value: v => this.handleResponse(v, invocationLogger, started),
      error: e => this.handleError(e, invocationLogger, invocationId)
    };

    const responseObserver = {
      next: r => this.handleResponse(r, invocationLogger, started),
      error: e => this.handleError(e, invocationLogger, invocationId),
      complete: () => this.handleCompleted(invocationLogger, invocationId),
      streamCompleted: () => this.handleStreamCompleted(invocationLogger)
    }

    invocationLogger.info('Starting invocation');

    try {
      let invocationClient: InvocationClient;
      switch (this.consumedMethod.method.type) {
        case MethodType.Unary:
          invocationClient = await this.interopClient.sendUnaryRequest(method, this.messageContent, handler);
          break;
        case MethodType.ServerStreaming:
          invocationClient = await this.interopClient.sendServerStreamingRequest(method, this.messageContent, responseObserver);
          break;
        case MethodType.ClientStreaming:
        case MethodType.DuplexStreaming:
          const streamingClient = await this.interopClient.sendBidiStreamingRequest(method, responseObserver);
          invocationClient = streamingClient;
          this.sendAndSchedule(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis, streamingClient, invocationLogger);
          break;
      }
      if (this.consumedMethod.method.type !== MethodType.Unary) {
        this.activeInvocationsMap.set(invocationId, {
          id: invocationId,
          client: invocationClient,
          logger: invocationLogger,
          started
        });
      }
    } catch (error) {
      this.handleError(error, invocationLogger, invocationId);
    }

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

  public hasRunningInvocations() {
    return this.activeInvocationsMap.size > 0;
  }

  public async cancelLatestInvocation() {
    if (this.activeInvocationsMap.size > 0) {
      const invocationProfile = pop(this.activeInvocationsMap)[1];
      try {
        invocationProfile.logger.info('Cancelling invocation');
        await invocationProfile.client.cancel();
        invocationProfile.logger.info('Cancelled invocation');
      } catch (error) {
        invocationProfile.logger.error('Failed to cancel invocation', error);
      }
    }
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
