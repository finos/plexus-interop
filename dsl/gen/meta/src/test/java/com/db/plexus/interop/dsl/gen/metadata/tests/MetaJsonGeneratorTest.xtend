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
package com.db.plexus.interop.dsl.gen.metadata.tests

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.ResourceSetValidator
import com.db.plexus.interop.dsl.gen.meta.MetaJsonGenerator
import com.google.inject.Inject
import java.nio.file.Files
import java.nio.file.Paths
import org.eclipse.emf.common.util.URI
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.XtextRunner
import org.junit.Test
import org.junit.runner.RunWith

import static org.junit.Assert.*

@RunWith(XtextRunner)
@InjectWith(InteropLangInjectionProvider)
class MetaJsonGeneratorTest {

    @Inject
    private XtextResourceSet resourceSet;
    
    @Inject
    private ResourceSetValidator validator;

    @Inject
    private MetaJsonGenerator outputGenerator;
            
    @Test
    def testFullContentGeneration() {
        	    
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/services/services.proto"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/model/messages.proto"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/components/component_a.interop"), true)
        resourceSet.getResource(getURI("com/db/plexus/interop/dsl/gen/tests/components/component_c.interop"), true)
        
        validator.validateResources(resourceSet)

        val expected = new String(Files.readAllBytes(Paths.get(getStandardURI("expected.json"))));

        val generatedResult = outputGenerator.generate(new PlexusGenConfig(), resourceSet)

        assertEqualsIgnoreWhiteSpaces(expected, generatedResult)
    }

    def getURI(String file) {
        return URI.createFileURI(getPath(file))
    }

    def getStandardURI(String file) {
        typeof(ClassLoader).getResource("/" + file).toURI()
    }

    def getPath(String file) {
        return getStandardURI(file).getPath()
    }

    def assertEqualsIgnoreWhiteSpaces(String s1, String s2) {
        assertEquals("Equals ignoring whitespaces",
        s1.replaceAll("\\s", ""),
        s2.replaceAll("\\s", ""));
    }
}
