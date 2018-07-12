/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ActionReference } from '@plexus-interop/client-api';

/**
 * Invokes registered action handlers
 */
export interface ActionInvoker {

    /**
     * Invokes registered action handler, applying serialization/deserialization logic on request/response
     * 
     * @param actionReference Action reference
     * @param requestPayload Request Payload (structured object)
     */
    invokeUnaryHandler(actionReference: ActionReference, requestPayload: any): Promise<any>;

    /**
     * Invokes registered action handler
     * 
     * @param actionReference Action reference
     * @param requestPayloadBuffer Request payload  
     */
    invokeRawUnaryHandler(actionReference: ActionReference, requestPayloadBuffer: ArrayBuffer): Promise<ArrayBuffer>;
}