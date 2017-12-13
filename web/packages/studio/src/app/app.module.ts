import { AppActions } from './services/app.actions';
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

import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { createLogger } from 'redux-logger';
// import { rootReducer } from './reducers';
import { rootReducer, IAppState, INITIAL_STATE } from './services/store';

@NgModule({
  declarations: [
    AppComponent,
    MetadataLoaderComponent,
    AppListComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    FormsModule,
    RouterModule.forRoot(AppRoutes),
    NgReduxModule
  ],
  providers: [AppActions],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(ngRedux: NgRedux<IAppState>) {
    ngRedux.configureStore(
      rootReducer,
      INITIAL_STATE,
      [createLogger()]);
  }
}
