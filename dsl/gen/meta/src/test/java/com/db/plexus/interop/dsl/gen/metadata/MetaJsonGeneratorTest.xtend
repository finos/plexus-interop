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
package com.db.plexus.interop.dsl.gen.metadata

import org.junit.runner.RunWith
import org.eclipse.xtext.junit4.XtextRunner
import org.eclipse.xtext.junit4.InjectWith
import com.google.inject.Inject
import org.eclipse.xtext.resource.XtextResourceSet
import com.db.plexus.interop.dsl.gen.meta.MetaJsonGenerator
import org.eclipse.emf.common.util.URI
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import static org.junit.Assert.*;
import org.junit.Test
import java.nio.file.Files
import java.nio.file.Paths
import com.db.plexus.interop.dsl.gen.ResourceSetValidator

@RunWith(typeof(XtextRunner))
@InjectWith(typeof(InteropLangInjectionProvider))
class MetaJsonGeneratorTest {

    @Inject
    private XtextResourceSet resourceSet;
    
    @Inject
    private ResourceSetValidator validator;

    @Inject
    private MetaJsonGenerator outputGenerator;
    
    @Test
    def testFullContentGeneration() {
    	
        resourceSet.getResource(getURI("services.proto"), true)
        resourceSet.getResource(getURI("messages.proto"), true)
        resourceSet.getResource(getURI("ComponentA.interop"), true)
        resourceSet.getResource(getURI("ComponentC.interop"), true)
        
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