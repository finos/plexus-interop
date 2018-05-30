/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.gen.meta

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.BaseGenTask
import org.eclipse.xtext.resource.XtextResourceSet
import static com.db.plexus.interop.dsl.validation.Issues.*;
import com.db.plexus.interop.dsl.validation.MetadataPatchValidator
import com.google.inject.Inject

class MetaPatchValidatorTask extends BaseGenTask {

    public static val NAME = "validate-patch"

    @Inject
    var MetadataPatchValidator metadataPatchValidator

    override doGen(PlexusGenConfig config) {

        val workingDirUri = getWorkingDir()
        val sourceBaseDir = getRelativeURI(config.source, workingDirUri)
        val targetBaseDir = getRelativeURI(config.target, workingDirUri)

        val sourceResourceSet = new XtextResourceSet
        val targetResourceSet = new XtextResourceSet

        loadResources(sourceResourceSet, sourceBaseDir, config.isVerbose, "*.{proto,interop}");
        loadResources(targetResourceSet, targetBaseDir, config.isVerbose, "*.{proto,interop}");

        val issues = metadataPatchValidator.validatePatch(targetResourceSet, sourceResourceSet)
        if (!issues.empty) {
            if(config.isVerbose()) {
                val issuesString = issuesToString(issues.sortWith(issuesComparator));
                println(issuesString)
            }
            if (hasErrors(issues)) {
                System.exit(1);
            }
        }

    }

}