/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { plexus } from '../gen/internal-client-protocol';

export class ClientProtocolUtils {

    public static createSummarizedCompletion(...completions: plexus.ICompletion[]): plexus.ICompletion {
        const errors: plexus.IError[] = [];
        completions = completions.filter(c => !!c);
        completions.forEach(completion => {
            const status: plexus.Completion.Status = completion.status as plexus.Completion.Status;
            if (status === plexus.Completion.Status.Canceled || status === plexus.Completion.Status.Failed) {
                errors.push(completion.error || {
                        message: `Unknown error, completion status ${status}`
                    });
            }
        });
        if (errors.length > 0) {
            const messages = new Array();
            errors.forEach(error => {
                messages.push(error.message);
            });
            return {
                status: plexus.Completion.Status.Failed,
                error: {
                    message: messages.join('\n')
                }
            };
        } else {
            return {
                status: plexus.Completion.Status.Completed
            };
        }
    }

    public static isSuccessCompletion(completion: plexus.ICompletion): boolean {
        return completion && (completion.status === undefined || completion.status === plexus.Completion.Status.Completed);
    }

}