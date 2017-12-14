import { Subscription } from 'rxjs/Subscription';
import { App } from './../services/model';
import { IAppState } from '../services/store';
import { NgRedux, select } from '@angular-redux/store';
import { AppActions } from '../services/app.actions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/combineLatest';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @select('metadataUrl') readonly metadataUrl$: Observable<string>;
  @select('connected') readonly connected$: Observable<boolean>;
  @select('application') readonly application$: Observable<App>;

  currentApp: App;

  private subscriptions: Subscription[] = [];

  constructor(
    private actions: AppActions,
    private ngRedux: NgRedux<IAppState>,
    private router: Router) {
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
    this.ngRedux.dispatch(this.actions.disconnect());
    this.router.navigate(['/home']);
  }

  disconnectFromApp() {
    this.ngRedux.dispatch(this.actions.disconnectFromApp());
    this.router.navigate(['/apps']);
  }

  openCurrentApp() {
    if (this.currentApp) {
      this.ngRedux.dispatch(this.actions.connectToApp(this.currentApp));
      this.router.navigate(['/app']);
    }
  }
}
