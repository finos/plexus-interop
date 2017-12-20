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
import { AppActions } from "../services/app.actions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/reducers';
import { ProvidedMethod } from "@plexus-interop/broker";
import { InteropClient } from "../services/InteropClient";
import { SubsctiptionsRegistry } from "../services/SubsctiptionsRegistry";
import { Logger, LoggerFactory } from "@plexus-interop/common";

@Component({
  selector: 'app-provided-service',
  templateUrl: './provided-service.component.html',
  styleUrls: ['./provided-service.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class ProvidedServiceComponent implements OnInit {

  private readonly log: Logger = LoggerFactory.getLogger("ProvidedServiceComponent");

  private providedMethod: ProvidedMethod;

  private interopClient: InteropClient;

  messageContent: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private subscriptions: SubsctiptionsRegistry) { }

  ngOnInit() {
    this.subscriptions.add(this.store
      .filter(state => !!state.plexus.providedMethod)
      .map(state => state.plexus)
      .subscribe(plexus => {
        this.providedMethod = plexus.providedMethod.method;
        this.interopClient = plexus.services.interopClient;
      }));
  }

  intercept() {
    if (this.interopClient) {
      this.interopClient.setUnaryActionHandler(
        this.providedMethod.providedService.service.id,
        this.providedMethod.method.name,
        async requestJson => {
          this.log.info(`"Received request: ${this.format(requestJson)}`);
          return this.messageContent;
        });
      this.log.info("Set interceptor");
    }
  }

  format(data) {
    return JSON.stringify(JSON.parse(data), null, 2);
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
