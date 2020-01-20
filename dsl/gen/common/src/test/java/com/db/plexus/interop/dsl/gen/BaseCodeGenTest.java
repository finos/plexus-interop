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
package com.db.plexus.interop.dsl.gen;

import java.nio.file.Path;
import java.nio.file.Paths;

public class BaseCodeGenTest {

    protected Path[] getExampleEntries() throws Exception {
        return new Path[]{
                Paths.get(getClass().getResource("/TestComponentA.interop").toURI()),
                Paths.get(getClass().getResource("/TestComponentB.interop").toURI()),
                Paths.get(getClass().getResource("/Model.proto").toURI()),
                Paths.get(getClass().getResource("/Services.proto").toURI())
        };
    }

}
