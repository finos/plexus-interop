/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { State } from './RootReducers';
import { Injectable } from '@angular/core';
import { Action } from 'redux';

@Injectable()
export class AppActions {
    
    static METADATA_LOAD_START = 'METADATA_LOAD_START';
    static METADATA_LOAD_FAILED = 'METADATA_LOAD_FAILED';   
    static METADATA_LOAD_SUCCESS = 'METADATA_LOAD_SUCCESS';
    
    static DISCONNECT_FROM_PLEXUS = 'DISCONNECT_FROM_PLEXUS';
    static DISCONNECT_FROM_PLEXUS_SUCCESS = 'DISCONNECT_FROM_PLEXUS_SUCCESS';

    static SELECT_CONSUMED_METHOD = 'SELECT_CONSUMED_METHOD';
    static CONSUMED_METHOD_SUCCESS = 'CONSUMED_METHOD_SUCCESS';

    static SELECT_PROVIDED_METHOD = 'SELECT_PROVIDED_METHOD';
    
    static DISCONNECT_FROM_APP = 'DISCONNECT_FROM_APP';
    static DISCONNECT_FROM_APP_SUCCESS = 'DISCONNECT_FROM_APP_SUCCESS';
    
    static CONNECT_TO_APP_START = 'CONNECT_TO_APP_START';
    static CONNECT_TO_APP_FAILED = 'CONNECT_TO_APP_FAILED';
    static CONNECT_TO_APP_SUCCESS = 'CONNECT_TO_APP_SUCCESS';

    static DISCOVER_METHODS_SUCCESS = 'DISCOVER_METHODS_SUCCESS';

    static DO_NOTHING = 'DO_NOTHING';
   
    static AUTO_CONNECT = 'AUTO_CONNECT';
    
}
