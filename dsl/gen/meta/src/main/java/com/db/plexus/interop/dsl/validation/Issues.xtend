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
package com.db.plexus.interop.dsl.validation

import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.validation.Issue;
import java.util.Comparator
import java.util.List
import java.util.stream.Collectors

public class Issues {

    def static Issue createError(String message, String code) {
        val issue = new Issue.IssueImpl();
        issue.setCode(code)
        issue.setMessage(message)
        issue.setSeverity(Severity.ERROR)
        return issue
    }

    def static Comparator<Issue> issuesComparator() {
        new IssuesComparator()
    }

    def static issuesToString(List<Issue> issues) {
        if(issues.isEmpty) {
            return successStringResult()
        }
        val errorsBuilder = new StringBuilder()
        issues.fold(errorsBuilder) [builder, issue | builder.append(issueToString(issue)).append("\n")]
        return errorsBuilder.toString()
    }

    def static issueToString(Issue issue) {
        val result = new StringBuilder(issue.severity.name());
        result.append(": ").append(issue.getMessage());
        result.append(" [");
        if(issue.getUriToProblem() !== null) {
            result.append(issue.getUriToProblem().trimFragment());
        }
        if(issue.lineNumber !== null || issue.column !== null) {
            result.append(" line : ")
            .append(issue.lineNumber).append(" column : ").append(issue.column);
        }
        return result.append("]").toString();
    }

    def static boolean hasErrors(List<Issue> issues) {
        return !issues.stream()
        .filter[issue | issue.getSeverity() == Severity.ERROR]
        .collect(Collectors.toList)
        .isEmpty
    }

    def static successStringResult() { "No issues found" }

}

class IssuesComparator implements Comparator<Issue> {
    override int compare (Issue function1, Issue function2) {
        if(function1.getSeverity() == function2.getSeverity()) {
            return 0;
        } else {
            return if(function1.getSeverity() == Severity.ERROR) 1 else -1;
        }
    }
}