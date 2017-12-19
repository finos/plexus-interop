import { TransportConnectionFactory } from './services/core/TransportConnectionFactory';
import { InteropClientFactory } from './services/core/InteropClientFactory';
import { InteropServiceFactory } from './services/core/InteropServiceFactory';
import { metaReducers } from './services/ui/root-reducers';
import { AppActions } from './services/ui/app.actions';
import { AppRoutes } from './app.routing';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MetadataLoaderComponent } from './metadata-loader/metadata-loader.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppListComponent } from './app-list/app-list.component';
import { HeaderComponent } from './header/header.component';

import { reducers } from './services/ui/root-reducers';
import { AppServicesComponent } from './app-services/app-services.component';
import { ConsumedServiceComponent } from './consumed-service/consumed-service.component';
import { ProvidedServiceComponent } from './provided-service/provided-service.component';

import { StoreModule } from '@ngrx/store';

import { EffectsModule } from '@ngrx/effects';
import { Effects } from './services/ui/effects';
import { HttpModule } from '@angular/http';

import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    MetadataLoaderComponent,
    AppListComponent,
    HeaderComponent,
    AppServicesComponent,
    ConsumedServiceComponent,
    ProvidedServiceComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    FormsModule,
    RouterModule.forRoot(AppRoutes),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([Effects]),
    HttpModule
  ],
  providers: [
    AppActions,
    InteropServiceFactory,
    InteropClientFactory,
    TransportConnectionFactory
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
