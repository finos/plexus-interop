/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
/*
 * generated by Xtext 2.12.0
 */
package com.db.plexus.interop.dsl.validation

import com.db.plexus.interop.dsl.ConsumedMethod
import com.db.plexus.interop.dsl.DslPackage
import com.db.plexus.interop.dsl.ProvidedMethod
import org.eclipse.xtext.EcoreUtil2
import org.eclipse.xtext.validation.Check

/**
 * This class contains custom validation rules. 
 *
 * See https://www.eclipse.org/Xtext/documentation/303_runtime_concepts.html#validation
 */
class InteropLangValidator extends AbstractInteropLangValidator {
	
	override def isLanguageSpecific() {
		false
	}
		
	@Check
	def checkUniqueConsumedMethod(ConsumedMethod consumedMethod) {		
		for (otherConsumedMethod : EcoreUtil2.getSiblingsOfType(consumedMethod, typeof(ConsumedMethod))) {
			if (otherConsumedMethod.method.equals(consumedMethod.method)) {
				error("Duplicated consumed method definition: " + consumedMethod.method.name, DslPackage.Literals.CONSUMED_METHOD__METHOD);								
			}			
		}						
	}
	
	@Check
	def checkUniqueProvidedMethod(ProvidedMethod providedMethod) {		
		for (otherProvidedMethod : EcoreUtil2.getSiblingsOfType(providedMethod, typeof(ProvidedMethod))) {
			if (otherProvidedMethod.method.equals(providedMethod.method)) {
				error("Duplicated provided method definition: " + providedMethod.method.name, DslPackage.Literals.PROVIDED_METHOD__METHOD);								
			}			
		}						
	}
}
