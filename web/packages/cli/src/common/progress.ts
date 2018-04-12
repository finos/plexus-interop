/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import * as ProgressBar from 'progress';

export function printProgress(response: any, text: string): void {
    text = text || 'Downloading';
    const length = parseInt(response.headers['content-length'], 10);
    const progress = new ProgressBar(`${text} [:bar] :percent :etas`, {
        complete: '=',
        incomplete: '.',
        width: 80,
        total: length
    });
    response.on('data', (chunk: any) => progress.tick(chunk.length));
}
