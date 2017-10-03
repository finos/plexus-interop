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
package com.db.plexus.interop.dsl.protobuf.tests

import com.db.plexus.interop.dsl.protobuf.ProtoLangRuntimeModule
import com.db.plexus.interop.dsl.protobuf.ProtoLangConfig
import org.eclipse.emf.common.util.URI

class ProtoTestInjectorProvider extends ProtoLangInjectorProvider {	
	override createRuntimeModule() {
		val r = ClassLoader.getSystemClassLoader().getResource("com/db/plexus/interop/dsl/protobuf/tests/common.proto")
		val baseUri = URI.createURI(r.toURI().toString()).trimSegments(1).appendSegment("");		
		System.out.println("Using base dir: " + baseUri)		
		val options = new ProtoLangConfig()
		options.baseURIs.add(baseUri)		
		// make it work also with Maven/Tycho and OSGI
		// see https://bugs.eclipse.org/bugs/show_bug.cgi?id=493672
		return new ProtoLangRuntimeModule(options) {			
			override bindClassLoaderToInstance() {
				typeof(ProtoTestInjectorProvider).getClassLoader();
			}
		};
	}
}