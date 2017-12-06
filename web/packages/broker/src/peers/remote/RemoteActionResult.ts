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
import { RemoteActionStatus } from "./RemoteActionStatus";
import { ClientError } from "@plexus-interop/protocol";

export interface RemoteActionResult {

    status: RemoteActionStatus;

    payload?: any;

    error?: ClientError;

}

export function isFailed(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.FAILURE;
}

export function isSucceded(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.SUCCESS;
}

export function isCompleted(result: RemoteActionResult): boolean {
    return result.status === RemoteActionStatus.SUCCESS;
}

export function successResult(payload: any): RemoteActionResult {
    return {
        status: RemoteActionStatus.SUCCESS,
        payload
    };
}

export function completedResult(payload?: any): RemoteActionResult {
    return {
        status: RemoteActionStatus.COMPLETED,
        payload
    };
}

export function errorResult(error?: ClientError): RemoteActionResult {
    return {
        error,
        status: RemoteActionStatus.FAILURE
    };
}