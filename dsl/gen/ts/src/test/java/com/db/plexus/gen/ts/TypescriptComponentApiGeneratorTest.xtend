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
package com.db.plexus.gen.ts

import org.eclipse.xtext.junit4.XtextRunner
import org.eclipse.xtext.junit4.InjectWith
import org.junit.runner.RunWith
import com.google.inject.Inject
import org.junit.Test
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.ts.TypescriptApplicationApiGenerator
import java.util.Arrays
import com.db.plexus.interop.dsl.gen.InteropLangUtils
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.emf.common.util.URI

@RunWith(typeof(XtextRunner))
@InjectWith(typeof(InteropLangInjectionProvider))
class TypescriptComponentApiGeneratorTest extends BaseCodeOutputGeneratorTest {

    @Inject
    private XtextResourceSet resourceSet;

    @Inject
    TypescriptApplicationApiGenerator outputGenerator;

    @Test
    def testFullContentGeneration() {

        resourceSet.getResource(getURI("services.proto"), true)
        resourceSet.getResource(getURI("messages.proto"), true)
        resourceSet.getResource(getURI("ComponentA.interop"), true)
        resourceSet.getResource(getURI("ComponentC.interop"), true)

        val apps = InteropLangUtils.getApplications(resourceSet.getResources())

        var plexusConfig = new PlexusGenConfig();
        plexusConfig.namespace = "plexus"
        plexusConfig.externalDependencies = Arrays.asList("./plexus-messages")

        val generatedResult = outputGenerator.generate(plexusConfig, apps.get(0),
            resourceSet.getResources())

        assertEqualsIgnoreWhiteSpaces(fullExpectedContent.toString, generatedResult)
    }

    def getURI(String file) {
        return URI.createFileURI(typeof(ClassLoader).getResource("/" + file).toURI().getPath())
    }

}