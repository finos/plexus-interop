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
package com.db.plexus.interop.dsl.gen.js.tests

import com.db.plexus.interop.dsl.gen.GenUtils
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.js.JsComponentApiGenerator
import com.google.inject.Inject
import java.nio.file.Files
import java.nio.file.Paths
import java.util.Arrays
import org.eclipse.emf.common.util.URI
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.XtextRunner
import org.junit.Test
import org.junit.runner.RunWith

import static org.junit.Assert.*
import com.db.plexus.interop.dsl.gen.test.InteropLangInjectionProvider
import com.db.plexus.interop.dsl.gen.test.ResourceUtils

@RunWith(typeof(XtextRunner))
@InjectWith(typeof(InteropLangInjectionProvider))
class JsComponentApiGeneratorTest {
	
    @Inject
    private XtextResourceSet resourceSet;      

    @Inject
    JsComponentApiGenerator outputGenerator;
    
    @Test
    def void testFullContentGeneration() {
						
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/services/services.proto"), true)
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/model/messages.proto"), true)
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_a.interop"), true)
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_c.interop"), true)

        val apps = GenUtils.getApplications(resourceSet.getResources())

        var plexusConfig = new PlexusGenConfig();
        plexusConfig.namespace = "plexus"
        plexusConfig.externalDependencies = Arrays.asList("./plexus-messages")

        val generatedResult = outputGenerator.generate(plexusConfig, apps.get(0), resourceSet.getResources())
        
        val expectedURI = ResourceUtils.resolveStandardURI("com/db/plexus/interop/dsl/gen/js/tests/expected.data")
        val expected = new String(Files.readAllBytes(Paths.get(expectedURI)))       

        assertEqualsIgnoreWhiteSpaces(expected, generatedResult)                    
    }
  
    def assertEqualsIgnoreWhiteSpaces(String s1, String s2) {
        assertEquals("Equals ignoring whitespaces", s1.replaceAll("\\s", ""), s2.replaceAll("\\s", ""))
    }
}