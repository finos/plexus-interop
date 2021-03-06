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
package com.db.plexus.interop.dsl.gen.cli

import com.google.inject.Injector
import org.eclipse.emf.common.util.URI;
import com.db.plexus.interop.dsl.InteropLangStandaloneSetup

class CLISetup {

    public val Injector injector;
    public val URI baseDir;
    public val URI workDir;
    public val InteropLangStandaloneSetup interopLangSetup;

    new (Injector injector, URI baseDir, URI workDir, InteropLangStandaloneSetup interopLangSetup) {
        this.injector = injector
        this.baseDir = baseDir
        this.workDir = workDir
        this.interopLangSetup = interopLangSetup
    }
}