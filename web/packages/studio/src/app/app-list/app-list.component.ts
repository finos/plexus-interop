import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {

  constructor() { }

  appList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => { return { name: 'Service ' + i }; });

  ngOnInit() {
  }

}
