import { Component, OnInit } from '@angular/core';
import { AppActions } from "../services/ui/app.actions";
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/ui/root-reducers';
import { ProvidedMethod } from "@plexus-interop/broker";
import { InteropClient } from "../services/core/InteropClient";
import { SubscriptionsRegistry } from "../services/ui/SubscriptionsRegistry";
import { Logger, LoggerFactory } from "@plexus-interop/common";

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
