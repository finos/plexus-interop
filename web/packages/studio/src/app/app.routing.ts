import { ProvidedServiceComponent } from './provided-service/provided-service.component';
import { ConsumedServiceComponent } from './consumed-service/consumed-service.component';
import { AppServicesComponent } from './app-services/app-services.component';
import { AppListComponent } from './app-list/app-list.component';
import { MetadataLoaderComponent } from './metadata-loader/metadata-loader.component';
import { Routes } from '@angular/router';

export const AppRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MetadataLoaderComponent },
  { path: 'apps', component: AppListComponent, resolve: [] },
  { path: 'app', component: AppServicesComponent },
  { path: 'consumed', component: ConsumedServiceComponent },
  { path: 'consumed', component: ProvidedServiceComponent }
];