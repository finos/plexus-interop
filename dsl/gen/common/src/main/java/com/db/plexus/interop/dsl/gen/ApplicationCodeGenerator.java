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
package com.db.plexus.interop.dsl.gen;

import com.db.plexus.interop.dsl.Application;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import java.util.List;
import java.util.stream.Collectors;

public abstract class ApplicationCodeGenerator {

    public static final String TS = "ts";

    public static final String JS = "js";
    
    public final String generate(PlexusGenConfig genConfig, Application application, ResourceSet resourceSet) {    	
    	return generate(
    		genConfig,
    		application,
    		resourceSet
    			.getResources()
    			.stream()
    			.filter(x -> 
    				!x.getURI().toString().endsWith("google/protobuf/descriptor.proto") && 
    				!x.getURI().toString().endsWith("interop/Descriptor.proto"))
    			.collect(Collectors.toList()));
    }

    protected abstract String generate(PlexusGenConfig genConfig, Application application, List<Resource> resources);    
}
