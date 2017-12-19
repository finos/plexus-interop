import { SubscriptionsRegistry } from '../services/ui/SubscriptionsRegistry';
import { AppActions } from '../services/ui/app.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/ui/root-reducers';
import 'rxjs/add/operator/first';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.css'],
  providers: [SubscriptionsRegistry]
})
export class MetadataLoaderComponent implements OnInit, OnDestroy {
  public metadataUrl: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubscriptionsRegistry) {
  }

  ngOnInit() {
    let metadataUrlObs = this.store.select(state => state.plexus.metadataUrl);
    this.subscriptions.add(metadataUrlObs.first().subscribe(metadataUrl => {
      this.metadataUrl = metadataUrl;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribeAll();
  }

  connect(metadataUrl: string) {
    var checkAbsPat = /^https?:\/\//i

    this.store.dispatch({
      type: AppActions.METADATA_LOAD_START,
      payload: {
        baseUrl: checkAbsPat.test(metadataUrl) ? metadataUrl : window.location.origin + metadataUrl,
        silentOnFailure: false
      }
    });
  }
}
