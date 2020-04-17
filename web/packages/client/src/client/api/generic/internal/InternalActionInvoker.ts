/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { ActionReference, MethodInvocationContext } from '@plexus-interop/client-api';

/**
 * Invokes registered action handlers on behalf of other app
 */
export interface InternalActionInvoker {

    /**
     * Invokes registered action handler, applying serialization/deserialization logic on request/response
     * 
     * @param invocationContext Method invocation context
     * @param actionReference Action reference
     * @param requestPayload Request Payload (structured object)
     */
    invokeUnaryHandler(invocationContext: MethodInvocationContext, actionReference: ActionReference, requestPayload: any): Promise<any>;

    /**
     * Invokes registered action handler
     * 
     * @param invocationContext Method invocation context
     * @param actionReference Action reference
     * @param requestPayloadBuffer Request payload  
     */
    invokeRawUnaryHandler(invocationContext: MethodInvocationContext, actionReference: ActionReference, requestPayloadBuffer: ArrayBuffer): Promise<ArrayBuffer>;
}