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
import { ClientError, InvocationMetaInfo, InvocationRequestInfo } from "@plexus-interop/protocol";
import { isString } from "@plexus-interop/common";
import { UniqueId } from "@plexus-interop/transport-common";
import { ProvidedMethodReference } from "@plexus-interop/client-api";

export class ClientDtoUtils {

    public static targetInvocationHash(invocation: InvocationRequestInfo): string {
        return `${invocation.serviceId}.${invocation.serviceAlias}.${invocation.methodId}`;
    }

    public static providedMethodToInvocationInfo(providedMethod: ProvidedMethodReference): InvocationMetaInfo {
        if (providedMethod.providedService) {
            return {
                serviceId: providedMethod.providedService.serviceId,
                serviceAlias: providedMethod.providedService.serviceAlias,
                methodId: providedMethod.methodId,
                applicationId: providedMethod.providedService.applicationId,
                connectionId: providedMethod.providedService.connectionId as UniqueId
            };
        } else {
            return {
                methodId: providedMethod.methodId
            };
        }
    }

    public static toError(error: any): ClientError {
        if (isString(error)) {
            return new ClientError(error);
        }
        const message = error.message && isString(error.message) ? error.message : "Unknown";
        const details = error.stack && isString(error.stack) ? error.stack : (error.details && isString(error.details) ? error.details : "Unknown");
        return new ClientError(message, details);
    }

}