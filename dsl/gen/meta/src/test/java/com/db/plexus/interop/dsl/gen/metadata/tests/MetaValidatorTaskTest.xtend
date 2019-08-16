/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.gen.metadata.tests

import com.db.plexus.interop.dsl.gen.ResourceSetValidator
import com.db.plexus.interop.dsl.gen.test.InteropLangInjectionProvider
import com.db.plexus.interop.dsl.gen.test.ResourceUtils
import com.google.inject.Inject
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.XtextRunner
import org.junit.Test
import org.junit.runner.RunWith
import static org.hamcrest.CoreMatchers.*;

import static org.junit.Assert.*
import static com.db.plexus.interop.dsl.validation.Issues.*;

@RunWith(XtextRunner)
@InjectWith(InteropLangInjectionProvider)
class MetaValidatorTaskTest {

    @Inject
    protected ResourceSetValidator validator;

    @Test
    def testValidMetadata() {

        val resourceSet = new XtextResourceSet()

        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_a.interop"), true)
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_c.interop"), true)

        val stringResult = issuesToString(validator.getValidationIssues(resourceSet))

        assertEquals(successStringResult(), stringResult)
    }

    @Test
    def testInvalidMetadata() {

        val resourceSet = new XtextResourceSet()

        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_a_invalid.interop"), true)
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_c.interop"), true)

        val stringResult = issuesToString(validator.getValidationIssues(resourceSet))

        assertThat(stringResult, containsString("ERROR: Couldn't resolve reference to Service 'com.db.plexus.interop.dsl.gen.test.services.ExampleService_NotExists"));
        assertThat(stringResult, containsString("ERROR: Couldn't resolve reference to Method 'PointToPoint'"));

    }

}
