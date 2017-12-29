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
import { UniqueId, clientProtocol as plexus } from "@plexus-interop/protocol";
import { GUID } from "@plexus-interop/common";

describe("UniqueId", () => {

    it("Can be created from string and converted back", () => {
        const guidString = "C2EBE9A500AC114382A50C11EDC47EFA";
        const uniqueId = UniqueId.fromGuid(new GUID(guidString));
        expect(uniqueId.toString()).toEqual(guidString);
    });

    it("Parses GUID string in the same way as Broker", () => {
        const guidString = "C2EBE9A500AC114382A50C11EDC47EFA";
        const uniqueId = UniqueId.fromGuid(new GUID(guidString));
        expect(uniqueId.hi.toString(10)).toEqual("14045576757775176003");
        expect(uniqueId.lo.toString(10)).toEqual("9413943867230945018");
    });

    it("Can be serialyzed from string to Proto and restored back", () => {
        const guidString = "4687E14CC9F84270B0862703616225C7";
        const uniqueId = UniqueId.fromString(guidString);
        const fromProps = UniqueId.fromProperties(uniqueId as plexus.IUniqueId);
        expect(guidString).toEqual(fromProps.toString());
    });

});