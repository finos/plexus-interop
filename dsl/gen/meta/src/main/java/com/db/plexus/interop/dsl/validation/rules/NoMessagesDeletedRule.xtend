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
package com.db.plexus.interop.dsl.validation.rules

import org.eclipse.xtext.resource.XtextResourceSet
import com.db.plexus.interop.dsl.gen.GenUtils
import com.google.inject.Inject
import org.eclipse.xtext.validation.Issue;
import org.eclipse.xtext.diagnostics.Severity

class NoMessagesDeletedRule implements UpdateRule {

    val GenUtils genUtils;

    @Inject
    new(GenUtils genUtils) {
        this.genUtils = genUtils;
    }

    override getCode() '''deleted-messages'''

    override validate(XtextResourceSet baseResourceSet, XtextResourceSet updatedResourceSet) {
        val baseMessages = genUtils.getMessagesMap(baseResourceSet.resources);
        val updatedMessageIds = genUtils.getMessagesMap(updatedResourceSet.resources).keySet;
        return baseMessages.keySet
        .filter[id | !updatedMessageIds.contains(id)]
        .map([id | createIssue(id)])
        .toList()
    }

    def Issue createIssue(String missedId) {
        val issue = new Issue.IssueImpl();
        issue.setCode(this.getCode())
        issue.setMessage('''Message «missedId» is missed''')
        issue.setSeverity(Severity.ERROR)
        return issue
    }

}