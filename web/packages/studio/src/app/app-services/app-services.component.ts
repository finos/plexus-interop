import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from "@ngrx/store";
import * as fromRoot from '../services/reducers';
import { ConsumedMethod, InteropRegistryService } from "@plexus-interop/broker";
import { SubsctiptionsRegistry } from "../services/SubsctiptionsRegistry";

@Component({
  selector: 'app-services',
  templateUrl: './app-services.component.html',
  styleUrls: ['./app-services.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class AppServicesComponent implements OnInit {

  private registryService: InteropRegistryService;

  constructor(
    private store: Store<fromRoot.State>,
    private actions: AppActions,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
  }

  services = [1, 2, 3, 4, 5, 6, 7].map(i => {
    return {
      type: 'consumed',
      name: 'Service ' + i,
      actions: [
        { name: 'Action 1 ' + i },
        { name: 'Action 2 ' + i }
      ]
    };
  });

  ngOnInit() {
    this.subscriptions.add(this.store.select(state => state.plexus).subscribe(plexus => {
      this.registryService = plexus.services.interopRegistryService;
    }));
  }

  openConsumed() {

    if (this.registryService) {
      
      // TODO change to selected
      const consumedMethod: ConsumedMethod = 
        this.registryService.getApplication("com.db.cm.CashManager")
          .consumedServices[0].methods.get("OpenMT103");

      this.store.dispatch({ type: AppActions.SELECT_CONSUMED_METHOD, payload: consumedMethod });

    }
  }

  openProvided() {
    this.router.navigate(['/provided']);
  }

}
