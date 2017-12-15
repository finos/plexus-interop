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

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router) { }

  appList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
    return { name: 'Application ' + i };
  });

  ngOnInit() {
  }

  connectToApp(app: App) {
    this.store.dispatch({ type: AppActions.CONNECT_TO_APP, payload: app });
    this.router.navigate(['/app']);
  }
}
