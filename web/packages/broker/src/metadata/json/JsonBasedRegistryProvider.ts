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
import { RegistryProvider } from "../RegistryProvider";
import { Registry } from "../model/Registry";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/scan";

export class JsonBasedRegistryProvider implements RegistryProvider {

    private readonly $registry: Observable<Registry>;
    private current: Registry;

    public constructor(jsonMetadata: string, $jsonMetadata?: Observable<string>) {
        this.current = this.parseRegistry(jsonMetadata);
        this.$registry = ($jsonMetadata || Observable.of(jsonMetadata))
            .map(this.parseRegistry)
            .scan(r => this.current = r);
    }

    private parseRegistry(jsonRegistry: string): Registry {
        throw "Not implemented";
    }

    public getCurrent(): Registry {
        return this.current;
    }

    public getRegistry(): Observable<Registry> {
        return this.$registry;
    }

}