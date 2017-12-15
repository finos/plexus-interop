import { Subscription } from 'rxjs/Subscription';
import { App } from './../services/model';
import { AppActions } from '../services/app.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/combineLatest';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly metadataUrl$: Observable<string>;
  readonly connected$: Observable<boolean>;
  readonly application$: Observable<App>;

  currentApp: App;

  private subscriptions: Subscription[] = [];

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router) {
    this.metadataUrl$ = store.select(state => state.plexus.metadataUrl);
    this.application$ = store.select(state => state.plexus.application);
    this.connected$ = store.select(state => state.plexus.connected);
  }

  ngOnInit() {
    this.subscriptions.push(this.application$.subscribe(app => this.currentApp = app));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  disconnectFromPlexus() {
    this.store.dispatch({ type: AppActions.DISCONNECT_FROM_PLEXUS });
    this.router.navigate(['/home']);
  }

  disconnectFromApp() {
    this.store.dispatch({ type: AppActions.DISCONNECT_FROM_APP });
    this.router.navigate(['/apps']);
  }

  openCurrentApp() {
    if (this.currentApp) {
      this.store.dispatch({ type: AppActions.CONNECT_TO_APP, payload: this.currentApp });
      this.router.navigate(['/app']);
    }
  }
}
