import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from '../services/reducers';

@Component({
  selector: 'app-metadata-loader',
  templateUrl: './metadata-loader.component.html',
  styleUrls: ['./metadata-loader.component.css']
})
export class MetadataLoaderComponent implements OnInit {
  metadataUrl: string;

  constructor(
    private actions: AppActions,
    private store: Store<fromRoot.State>,
    private router: Router) { }

  ngOnInit() {
  }

  connect(metadataUrl: string) {
    this.store.dispatch({
      type: AppActions.METADATA_LOAD_START,
      payload: metadataUrl
    });
    console.info(this.metadataUrl);
    console.info(metadataUrl);

    this.router.navigate(['/apps']);
  }
}
