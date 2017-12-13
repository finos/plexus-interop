import { App } from './../services/model';
import { IAppState } from '../services/store';
import { NgRedux, select } from '@angular-redux/store';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @select('metadataUrl') readonly metadataUrl$: Observable<string>
  @select('connected') readonly connected$: Observable<boolean>

  
  @select('application') readonly application$: Observable<App>

  appConnected$: Observable<boolean>;
  appName$: Observable<string>

  constructor(
    private actions: AppActions,
    private ngRedux: NgRedux<IAppState>,
    private router: Router) {
  }

  ngOnInit() {
    this.appName$ = this.application$.map(app => app && app.name);
    this.appConnected$ = this.application$.map(app => !!app);
  }

  disconnectFromPlexus() {
    this.ngRedux.dispatch(this.actions.disconnect());
    this.router.navigate(['/home']);
  }

  disconnectFromApp() {
    this.ngRedux.dispatch(this.actions.disconnectFromApp());
    this.router.navigate(['/apps']);
  }
}
