import { IAppState } from '../services/store';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.scss']
})
export class MetadataLoaderComponent implements OnInit {

  constructor(
    private actions: AppActions,
    private ngRedux: NgRedux<IAppState>,
    private router: Router) { }

  ngOnInit() {
  }

  connect(metadataUrl: string) {
    this.ngRedux.dispatch(this.actions.connect());
    this.router.navigate(['/apps']);
  }
}
