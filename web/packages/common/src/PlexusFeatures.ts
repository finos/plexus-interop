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
export interface PlexusFeatures {
    readonly decodeUndefinedToDefault: boolean;
}

const plexusFeatures = {
    decodeUndefinedToDefault: true
};

export function setDecodeUndefinedToDefault(value: boolean): void {
    plexusFeatures.decodeUndefinedToDefault = value;
}

export function getPlexusFeatures(): PlexusFeatures {
    return plexusFeatures;
}
