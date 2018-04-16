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
import java.io.IOException
import com.google.inject.Inject
import com.db.plexus.interop.dsl.gen.util.FileUtils
import java.io.File
import java.util.ArrayList
import java.util.Arrays
import com.db.plexus.interop.dsl.gen.BaseGenTask
import org.eclipse.xtext.resource.XtextResourceSet
import java.util.logging.Logger;
import static com.db.plexus.interop.dsl.gen.util.ProcessUtils.*
import com.db.plexus.interop.dsl.gen.util.ProcessResult
import org.eclipse.xtext.validation.Issue;
import javax.print.attribute.standard.Severity
import java.util.List
import java.util.Comparator

class MetaValidatorTask extends BaseGenTask {

    override doGenWithResources(PlexusGenConfig config, XtextResourceSet rs) throws IOException {
        val issues = validator.getValidationIssues(rs)
        if (!issues.empty) {
            val issuesString = errorsString(issues);
            if(config.isVerbose() || config.outDir == null) {
                println(issuesString)
            }
            if (config.outDir != null) {
                FileUtils.writeStringToFile(new File(config.outDir), issuesString)
            }
            if (validator.hasErrors(issues)) {
                System.exit(1);
            }
        }
    }

    def errorsString(List<Issue> issues) {
        if (issues.isEmpty) {
            return successStringResult()
        }
        val sorted = issues.sortWith(new IssuesComparator())
        val errorsBuilder = new StringBuilder()
        errorsBuilder.append("Validation issues:").append("\n")
        issues.fold(new StringBuilder())[builder, issue | builder.append(issue.toString()).append("\n")]
        return errorsBuilder.toString()
    }

    override validateResources(XtextResourceSet resourceSet) {
        // skip default validation
    }

    override inputFilesGlob(PlexusGenConfig config) {
        "*.interop"
    }

    public def successStringResult() { "No issues found" }

}

class IssuesComparator implements Comparator<Issue> {
    override int compare (Issue function1, Issue function2) {
        if (function1.getSeverity() == function2.getSeverity()) {
            return 0;
        } else {
            return if (function1.getSeverity() == Severity.ERROR) 1 else -1;
        }
    }
}