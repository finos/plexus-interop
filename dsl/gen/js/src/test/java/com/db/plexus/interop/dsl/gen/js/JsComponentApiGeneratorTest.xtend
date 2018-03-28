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
package com.db.plexus.interop.dsl.gen.js

import org.eclipse.xtext.junit4.XtextRunner
import org.eclipse.xtext.junit4.InjectWith
import org.junit.runner.RunWith
import com.google.inject.Inject
import org.junit.Test
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.emf.common.util.URI
import java.util.Arrays
import com.db.plexus.interop.dsl.gen.GenUtils
import java.nio.file.Files
import java.nio.file.Paths
import static org.junit.Assert.*;

@RunWith(typeof(XtextRunner))
@InjectWith(typeof(InteropLangInjectionProvider))
class JsComponentApiGeneratorTest {

    @Inject
    private XtextResourceSet resourceSet;

    @Inject
    JsComponentApiGenerator outputGenerator;

    @Test
    def void testFullContentGeneration() {

        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/services/services.proto"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/model/messages.proto"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/components/component_a.interop"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/components/component_c.interop"), true)

        val apps = GenUtils.getApplications(resourceSet.getResources())

        var plexusConfig = new PlexusGenConfig();
        plexusConfig.namespace = "plexus"
        plexusConfig.externalDependencies = Arrays.asList("./plexus-messages")

        val generatedResult = outputGenerator.generate(plexusConfig, apps.get(0),
        resourceSet.getResources())
        
        val expectedURI = getStandardURI("com/db/plexus/interop/dsl/gen/js/expected.js")
        val expected = new String(Files.readAllBytes(Paths.get(expectedURI)))

		Files.write(Paths.get("out.txt"), generatedResult.bytes)

        assertEqualsIgnoreWhiteSpaces(expected, generatedResult)                    
    }

    def getURI(String file) {
        return URI.createFileURI(typeof(JsComponentApiGeneratorTest).getResource("/" + file).toURI().getPath())
    }
    
    def getStandardURI(String file) {
        typeof(JsComponentApiGeneratorTest).getResource("/" + file).toURI()
    }    
    
    def assertEqualsIgnoreWhiteSpaces(String s1, String s2) {
        assertEquals("Equals ignoring whitespaces", s1.replaceAll("\\s", ""), s2.replaceAll("\\s", ""))
    }
}