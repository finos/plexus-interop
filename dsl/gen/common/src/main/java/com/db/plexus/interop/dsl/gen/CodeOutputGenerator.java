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
package com.db.plexus.interop.dsl.gen;

import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.emf.ecore.resource.ResourceSet;

import com.db.plexus.interop.dsl.InteropLangUtils;
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils;

import java.util.List;
import java.util.stream.Collectors;

public abstract class CodeOutputGenerator {

	public static final String JSON_META = "json_meta";
    
    public static final String PROTO = "proto";
    
    public static final String PROTO_CSHARP = "proto_csharp";
    
    public static final String CSHARP = "csharp";
    
    public final String generate(PlexusGenConfig genConfig, ResourceSet resourceSet) {    	
    	return generate(
    		genConfig,
    		resourceSet
    			.getResources()
    			.stream()
    			.filter(x -> 
    				!x.getURI().toString().endsWith(ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH) && 
    				!x.getURI().toString().endsWith(InteropLangUtils.DESCRIPTOR_RESOURCE_PATH))
    			.collect(Collectors.toList()));
    }

    abstract protected String generate(PlexusGenConfig genConfig, List<Resource> resources);
}
