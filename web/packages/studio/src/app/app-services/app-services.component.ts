import { IAppState } from '../services/store';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './app-services.component.html',
  styleUrls: ['./app-services.component.scss']
})
export class AppServicesComponent implements OnInit {

  constructor(
    private actions: AppActions,
    private ngRedux: NgRedux<IAppState>,
    private router: Router) {
  }

  ngOnInit() {
  }

}
