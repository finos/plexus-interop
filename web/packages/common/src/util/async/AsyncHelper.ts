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
import { CancellationToken } from "./CancellationToken";

export class AsyncHelper {

    public static readonly STATUS_CHECK_INTERVAL: number = 0;

    public static waitFor(
        condition: (() => boolean),
        cancellationToken: CancellationToken = new CancellationToken(),
        interval: number = AsyncHelper.STATUS_CHECK_INTERVAL,
        timeout: number = -1): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let rejectTimeout: any;
            let checkTimeout: any;
            if (timeout > 0) {
                rejectTimeout = setTimeout(() => {
                    if (checkTimeout) {
                        clearTimeout(checkTimeout);
                    }
                    reject(`Waiting timeout ${timeout}ms passed`);
                }, timeout);
            }
            function success(): void {
                if (rejectTimeout) {
                    clearTimeout(rejectTimeout);
                }
                resolve();
            }
            function check(): void {
                const result = condition();
                if (result) {
                    success();
                } else if (cancellationToken.isCancelled()) {
                    reject(cancellationToken.getReason());
                } else {
                    checkTimeout = setTimeout(check, interval);
                }
            }
            check();
        });
    }

}