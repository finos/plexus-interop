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
package com.db.plexus.interop.dsl.validation.rules

import org.junit.runner.RunWith
import org.eclipse.xtext.testing.XtextRunner
import org.eclipse.xtext.testing.InjectWith
import com.db.plexus.interop.dsl.gen.test.InteropLangInjectionProvider
import com.google.inject.Inject
import org.junit.Test
import org.eclipse.xtext.resource.XtextResourceSet
import com.db.plexus.interop.dsl.gen.test.ResourceUtils
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.*;
import org.eclipse.xtext.EcoreUtil2
import org.eclipse.xtext.diagnostics.Severity

@RunWith(XtextRunner)
@InjectWith(InteropLangInjectionProvider)
class NoServicesDeletedRuleTest extends BaseRuleTest {

    @Inject
    var NoServicesDeletedRule rule

    @Test
    def testFalsePositive() {
        super.testFalsePositive(this.rule)
    }

    @Test
    def testNegative() {

        val baseResource = new XtextResourceSet()
        baseResource.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/services/services.proto"), true)
        EcoreUtil2.resolveAll(baseResource)

        val updatedResource = new XtextResourceSet()
        updatedResource.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/services/deleted_service.proto"), true)
        EcoreUtil2.resolveAll(updatedResource)

        val issues = rule.validate(baseResource, updatedResource)
        assertThat(issues, hasSize(1))

        val issue = issues.get(0)
        assertThat(issue.getCode(), is(equalTo(rule.getCode())))
        assertThat(issue.getMessage(), containsString("deleted"))
        assertThat(issue.getSeverity(), is(equalTo(Severity.ERROR)))

    }

}