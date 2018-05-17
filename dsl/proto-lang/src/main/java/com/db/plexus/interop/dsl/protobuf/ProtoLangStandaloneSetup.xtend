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
package com.db.plexus.interop.dsl.protobuf

import com.google.inject.Injector
import org.eclipse.emf.ecore.EPackage

/**
 * Initialization support for running Xtext languages without Equinox extension registry.
 */
class ProtoLangStandaloneSetup extends ProtoLangStandaloneSetupGenerated {	
		
	static def doSetup() {		
	}	

	override register(Injector injector) {
		if (!EPackage.Registry.INSTANCE.containsKey(ProtobufPackage.eNS_URI)) {
			EPackage.Registry.INSTANCE.put(ProtobufPackage.eNS_URI, ProtobufPackage.eINSTANCE);
		}
		StaticConfigHolder.protoLangConfig = injector.getInstance(typeof(ProtoLangConfig))
		super.register(injector)			
	}
}
