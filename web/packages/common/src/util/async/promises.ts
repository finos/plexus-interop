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
import { RetryConfig } from '../../RetryConfig';

export const defaultPromiseRetryConfig: RetryConfig = {
    retriesNum: 3,
    retryTimeoutInMillis: 500
};

type CatchHandler<T> = (error: any) => Promise<T>;

export function retriable<T>(
    action: () => Promise<T>,
    { retriesNum, retryTimeoutInMillis, errorHandler }: RetryConfig = defaultPromiseRetryConfig): () => Promise<T> {
    let count = retriesNum;
    const catchHandler: CatchHandler<T> = (error) => {
        if (count === 0) {
            throw error;
        }
        if (errorHandler) {
            errorHandler(error);
        }
        count--;
        return delayed(action, retryTimeoutInMillis)
                .catch(catchHandler);
    };
    return () => action().catch(catchHandler);
}

export function delayed<T>(action: () => Promise<T>, timeoutInMillis: number = defaultPromiseRetryConfig.retryTimeoutInMillis): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            action()
                .then(resolve)
                .catch(reject);
        }, timeoutInMillis);
    });
} 