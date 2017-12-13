import { IAppState } from '../services/store';
import { NgRedux, select } from '@angular-redux/store';
import { AppActions } from '../services/app.actions';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @select('metadataUrl') readonly metadataUrl$: Observable<number> 
  @select('connected') readonly connected$: Observable<boolean> 

  ngOnInit() {
  }

}
