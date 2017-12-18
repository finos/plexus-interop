import { App as Application } from '@plexus-interop/broker';
import { Observable } from 'rxjs/Observable';
import { AppActions } from '../services/app.actions';
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

  connectToApp(app: Application) {
    this.store.dispatch({ type: AppActions.CONNECT_TO_APP_START, payload: app });
  }

}
