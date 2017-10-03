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
import { GUID } from "@plexus-interop/common";
import { transportProtocol as plexus } from "@plexus-interop/protocol";
import * as Long from "long";

export class UniqueId {

    public lo: Long;
    public hi: Long;

    public toString(): string {
        return `${longToString(this.hi)}${longToString(this.lo)}`;
    }

    public static propsToString(props: plexus.IUniqueId): string {
        return `${longToString(props.hi)}${longToString(props.lo)}`;
    }

    public static generateNew(): UniqueId {
        return UniqueId.fromGuid(new GUID());
    }

    public static fromString(str: string): UniqueId {
        return UniqueId.fromGuid(new GUID(str));
    }

    public static fromGuid(guid: GUID): UniqueId {
        const guidString = guid.toString().replace(/-/g, "");
        const hiSth = guidString.substr(0, 16);
        const loStr = guidString.substr(16, 32);
        return UniqueId.fromProperties({
            lo: Long.fromString(loStr, true, 16),
            hi: Long.fromString(hiSth, true, 16)
        });
    }

    public static fromProperties(props: plexus.IUniqueId): UniqueId {
        return Object.assign(new UniqueId(), props);
    }

}

function longToString(x: number | Long | undefined): string {
    return x ? x.toString(16).toUpperCase() : "undefined";
}
