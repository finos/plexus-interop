/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppActions } from '../services/ui/AppActions';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/RootReducers';
import { ProvidedMethod } from '@plexus-interop/broker';
import { InteropClient } from '../services/core/InteropClient';
import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { Logger, LoggerFactory } from '@plexus-interop/common';
import { StreamingInvocationClient, MethodType } from '@plexus-interop/client';
import { createInvocationLogger } from '../services/core/invocation-utils';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { AbstractControl, FormControl } from '@angular/forms';
import { plexusMessageValidator } from '../services/ui/validators';

@Component({
  selector: 'app-provided-service',
  templateUrl: './provided-service.component.html',
  styleUrls: ['./provided-service.component.css'],
  providers: [SubscriptionsRegistry]
})
export class ProvidedServiceComponent implements OnInit, OnDestroy {

  private readonly log: Logger = LoggerFactory.getLogger('ProvidedServiceComponent');
  private readonly maxPrintedContent: number = 1024;
  private providedMethod: ProvidedMethod;
  private messageContentControl: FormControl = new FormControl('{}');
  private messageContent: string = '{}';

  private interopClient: InteropClient;

  messagesToSend: number = 1;
  messagesPeriodInMillis: number = 200;
  requesId: number = 0;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private subscriptions: SubscriptionsRegistry) { }

  ngOnInit() {
    this.subscriptions.add(this.store
      .filter(state => !!state.plexus.providedMethod)
      .map(state => state.plexus)
      .filter(plexus => !!plexus.services.interopClient && !!plexus.providedMethod)
      .subscribe(plexus => {
        this.providedMethod = plexus.providedMethod.method;
        this.interopClient = plexus.services.interopClient;
        this.messageContent = this.createDefaultPayload();
        this.messageContentControl.setValidators([
          plexusMessageValidator('messageContentControl', this.interopClient, this.providedMethod)
        ]);
        this.updateResponse(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis);
      }));
  }

  printRequest(requestJson: string, log) {
    if (requestJson.length > this.maxPrintedContent) {
      requestJson = `${requestJson.substring(0, this.maxPrintedContent)}...`;
    } else {
      requestJson = this.format(requestJson);
    }
    log.info(`Received request: ${requestJson}`);
  }

  handleError(e: any, log) {
    log.error(`Error received`, e);
  }

  handleCompleted(log) {
    log.info('Invocation completed');
  }

  handleStreamCompleted(log) {
    log.info('Remote stream completed');
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
  }

  updateResponse(contentJson: string, messagesToSend: number, messagesPeriodInMillis: number): void {

    const serviceId = this.providedMethod.providedService.service.id;
    const methodId = this.providedMethod.method.name;
    const serviceAlias = this.providedMethod.providedService.alias;

    switch (this.providedMethod.method.type) {
      case MethodType.Unary:
        this.interopClient.setUnaryActionHandler(
          serviceId,
          methodId,
          serviceAlias,
          async requestJson => {
            const invocationLogger = createInvocationLogger(this.providedMethod.method.type, ++this.requesId, this.log);
            this.printRequest(requestJson, invocationLogger);
            invocationLogger.info(`Sending message:\n${contentJson}`);
            return contentJson;
          });
        break;
      case MethodType.ServerStreaming:
        this.interopClient.setServerStreamingActionHandler(serviceId, methodId, serviceAlias, (request, client) => {
          const invocationLogger = createInvocationLogger(this.providedMethod.method.type, ++this.requesId, this.log);
          this.printRequest(request, invocationLogger);
          this.sendAndSchedule(contentJson, messagesToSend, messagesPeriodInMillis, client, invocationLogger);
        });
        break;
      case MethodType.ClientStreaming:
        this.interopClient.setBidiStreamingActionHandler(serviceId, methodId, serviceAlias, (client) => {
          const invocationLogger = createInvocationLogger(this.providedMethod.method.type, ++this.requesId, this.log);
          return {
            next: request => this.printRequest(request, invocationLogger),
            error: e => this.handleError(e, invocationLogger),
            complete: () => this.handleCompleted(invocationLogger),
            streamCompleted: () => {
              this.handleStreamCompleted(invocationLogger);
              this.sendAndSchedule(contentJson, messagesToSend, messagesPeriodInMillis, client, invocationLogger);
            }
          };
        });
        break;
      case MethodType.DuplexStreaming:
        this.interopClient.setBidiStreamingActionHandler(serviceId, methodId, serviceAlias, (client) => {
          const invocationLogger = createInvocationLogger(this.providedMethod.method.type, ++this.requesId, this.log);
          this.sendAndSchedule(contentJson, messagesToSend, messagesPeriodInMillis, client, invocationLogger);
          return {
            next: request => {
              this.printRequest(request, invocationLogger);
            },
            error: e => this.handleError(e, invocationLogger),
            complete: () => this.handleCompleted(invocationLogger),
            streamCompleted: () => this.handleStreamCompleted(invocationLogger)
          };
        });
        break;
    }
  }

  intercept() {
    this.updateResponse(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis);
    this.log.info('Response updated');
  }

  format(data) {
    return JSON.stringify(JSON.parse(data), null, 2);
  }

  sendAndSchedule(message: string, leftToSend: number, intervalInMillis: number, client: StreamingInvocationClient<string>, logger: Logger) {
    if (leftToSend > 0) {
      logger.info(`Sending message:\n${message}`);
      client.next(message);
      setTimeout(() => {
        this.sendAndSchedule(message, leftToSend - 1, intervalInMillis, client, logger);
      }, intervalInMillis);
    } else {
      logger.info('Sending completion');
      client.complete();
    }
  }

  isServerStreaming() {
    return this.providedMethod && (this.providedMethod.method.type === MethodType.ServerStreaming || this.providedMethod.method.type === MethodType.DuplexStreaming);
  }

  createDefaultMessage() {
    this.messageContent = this.createDefaultPayload();
  }

  createDefaultPayload() {
    const method = this.providedMethod.method;
    return this.format(this.interopClient.createDefaultPayload(method.responseMessage.id));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

}