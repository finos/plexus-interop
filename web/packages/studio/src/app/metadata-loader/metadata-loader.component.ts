import { SubsctiptionsRegistry } from '../services/SubsctiptionsRegistry';
import { AppActions } from '../services/app.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';
import 'rxjs/add/operator/first';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.css'],
  providers: [SubsctiptionsRegistry]
})
export class MetadataLoaderComponent implements OnInit, OnDestroy {
  public metadataUrl: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router,
    private subscriptions: SubsctiptionsRegistry) {
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
      payload: checkAbsPat.test(metadataUrl) ? metadataUrl : window.location.origin + metadataUrl
    });
  }
}
