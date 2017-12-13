import { AppListComponent } from './app-list/app-list.component';
import { MetadataLoaderComponent } from './metadata-loader/metadata-loader.component';
import { Routes } from '@angular/router';

export const AppRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MetadataLoaderComponent },
  { path: 'apps', component: AppListComponent, resolve: [] },
];