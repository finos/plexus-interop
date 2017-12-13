import { IAppState } from '../services/store';
import { AppActions } from '../services/app.actions';
import { App } from './../services/model';
import { Component, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {

  constructor(
    private actions: AppActions,
    private ngRedux: NgRedux<IAppState>,
    private router: Router) { }

  appList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => { return { name: 'Application ' + i }; });

  ngOnInit() {
  }

  connectToApp(app: App) {
    this.ngRedux.dispatch(this.actions.connectToApp(app));
    this.router.navigate(['/app']);
  }
}
