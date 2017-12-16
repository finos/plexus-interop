import { Application } from './../../../../broker/dist/main/src/metadata/apps/model/Application.d';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../services/app.actions';
import { App } from './../services/model';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../services/reducers';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.css']
})
export class AppListComponent implements OnInit {
  apps: Observable<Application[]>;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router) { }

  ngOnInit() {
    this.apps = this.store.select(state => state.plexus.apps);
  }

  connectToApp(app: App) {
    this.store.dispatch({ type: AppActions.CONNECT_TO_APP, payload: app });
    this.router.navigate(['/app']);
  }
}
