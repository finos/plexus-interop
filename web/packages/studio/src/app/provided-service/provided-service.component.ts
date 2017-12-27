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
import { Component, OnInit } from '@angular/core';
import { AppActions } from "../services/ui/AppActions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/ui/RootReducers';
import { ProvidedMethod } from "@plexus-interop/broker";
import { InteropClient } from "../services/core/InteropClient";
import { SubscriptionsRegistry } from "../services/ui/SubscriptionsRegistry";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { StreamingInvocationClient, MethodType } from "@plexus-interop/client";

@Component({
  selector: 'app-provided-service',
  templateUrl: './provided-service.component.html',
  styleUrls: ['./provided-service.component.css'],
  providers: [SubscriptionsRegistry]
})
export class ProvidedServiceComponent implements OnInit {

  private readonly log: Logger = LoggerFactory.getLogger("ProvidedServiceComponent");

  private providedMethod: ProvidedMethod;

  private interopClient: InteropClient;

  messageContent: string;
  messagesToSend: number = 1;
  messagesPeriodInMillis: number = 200;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private subscriptions: SubscriptionsRegistry) { }

  ngOnInit() {
    this.subscriptions.add(this.store
      .filter(state => !!state.plexus.providedMethod)
      .map(state => state.plexus)
      .subscribe(plexus => {
        this.providedMethod = plexus.providedMethod.method;
        this.interopClient = plexus.services.interopClient;
        this.createDefaultMessage();
      }));
  }

  printRequest(requestJson) {
    this.log.info(`"Received request: ${this.format(requestJson)}`);
  }

  handleError(e: any) {
    this.log.error(`Error received`, e);
  }

  handleCompleted() {
    this.log.info("Invocation completed received");
  }

  intercept() {

    if (this.interopClient && this.providedMethod) {

      const serviceId = this.providedMethod.providedService.service.id;
      const methodId = this.providedMethod.method.name;

      switch (this.providedMethod.method.type) {
        case MethodType.Unary:
          this.interopClient.setUnaryActionHandler(
            serviceId,
            methodId,
            async requestJson => {
              this.printRequest(requestJson);
              return this.messageContent;
            });
          break;
        case MethodType.ServerStreaming:
          this.interopClient.setServerStreamingActionHandler(serviceId, methodId, (request, client) => {
            this.printRequest(request);
            this.sendAndSchedule(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis, client);
          });
          break;
        case MethodType.ClientStreaming:
        case MethodType.DuplexStreaming:
          this.interopClient.setBidiStreamingActionHandler(serviceId, methodId, (client) => {
            this.log.info(`Sending ${this.messagesToSend} messages`);
            this.sendAndSchedule(this.messageContent, this.messagesToSend, this.messagesPeriodInMillis, client);
            return {
              next: request => {
                this.printRequest(request);
              },
              error: e => this.handleError(e),
              complete: () => {
                this.handleCompleted();
              }
            };
          });
          break;
      }
      this.log.info("Set interceptor");

    }
  }

  format(data) {
    return JSON.stringify(JSON.parse(data), null, 2);
  }

  sendAndSchedule(message: string, leftToSend: number, intervalInMillis: number, client: StreamingInvocationClient<string>) {
    if (leftToSend > 0) {
      this.log.info("Sending message");
      client.next(message);
      setTimeout(() => {
        this.sendAndSchedule(message, leftToSend - 1, intervalInMillis, client);
      }, intervalInMillis);
    } else {
      this.log.info("Sending completion");      
      client.complete();
    }
  }

  isServerStreaming() {
    return this.providedMethod && (this.providedMethod.method.type === MethodType.ServerStreaming || this.providedMethod.method.type === MethodType.DuplexStreaming);
  }

  createDefaultMessage() {
    if (this.providedMethod) {
      const method = this.providedMethod.method;
      this.messageContent = this.interopClient.createDefaultPayload(method.outputMessage.id);
      this.formatAndUpdateArea();
    }
  }

  formatAndUpdateArea() {
    this.messageContent = this.format(this.messageContent);
  }

}
