/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.protobuf.scoping

import com.google.inject.Inject
import java.util.ArrayList
import java.util.Collections
import java.util.HashMap
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EReference
import org.eclipse.xtext.naming.IQualifiedNameConverter
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.resource.EObjectDescription
import org.eclipse.xtext.resource.IEObjectDescription
import org.eclipse.xtext.scoping.ICaseInsensitivityHelper
import org.eclipse.xtext.scoping.IGlobalScopeProvider
import org.eclipse.xtext.scoping.IScope
import org.eclipse.xtext.scoping.impl.ImportedNamespaceAwareLocalScopeProvider

class ProtoLangLocalScopeProvider extends ImportedNamespaceAwareLocalScopeProvider {
	
	@Inject
	public new (
		IGlobalScopeProvider globalScopeProvider, 
		IQualifiedNameProvider qualifiedNameProvider, 
		IQualifiedNameConverter qualifiedNameConverter, 
		ICaseInsensitivityHelper caseInsensitivityHelper
	)
	{	
		super(globalScopeProvider, qualifiedNameProvider, qualifiedNameConverter, caseInsensitivityHelper)
	}
		
	def override IScope getScope(EObject context, EReference reference) {
		val contextName = qualifiedNameProvider.getFullyQualifiedName(context)
		if (contextName === null) {
			return getScope(context.eContainer, reference)
		}	
		val globalScope = getResourceScope(context.eResource, reference)
		val scope = new ProtoLangScope(globalScope, contextName, qualifiedNameProvider)
		return scope			
	}
	
	static class ProtoLangScope implements IScope {
		
		QualifiedName contextName
		IScope globalScope
		HashMap<String, Integer> segmentMap = new HashMap<String, Integer>
		IQualifiedNameProvider qualifiedNameProvider
		
		new(IScope globalScope, QualifiedName contextName, IQualifiedNameProvider qualifiedNameProvider) {
			this.globalScope = globalScope
			this.contextName = contextName
			for (var i=0; i<contextName.segmentCount; i++) {
				this.segmentMap.put(contextName.getSegment(i), i)			
			}
			this.qualifiedNameProvider = qualifiedNameProvider
		}
		
		override getAllElements() {
			val result = new ArrayList<IEObjectDescription>()
			for (elem: this.globalScope.allElements) {
				result.add(elem)
				val maxPrefixLength = Math.min(this.contextName.segmentCount, elem.name.segmentCount - 1)
				var i = 0;
				while (i < maxPrefixLength && this.contextName.getSegment(i).equals(elem.name.getSegment(i))) {
					i++
					val suffix = elem.name.skipFirst(i)
					if (this.segmentMap.getOrDefault(suffix.firstSegment, i) == i) {
						result.add(EObjectDescription.create(suffix, elem.EObjectOrProxy))							
					}					
				}
			}
			return result
		}
		
		override getElements(QualifiedName name) {
			val candidate = getSingleElement(name)			
			if (candidate !== null) {
				return Collections.singleton(candidate)
			} else {
				return Collections.emptySet
			}
		}
		
		override getElements(EObject object) {
			val name = this.qualifiedNameProvider.getFullyQualifiedName(object)
			if (name === null) {
				return getElements(object.eContainer)
			}
			return getElements(name)
		}
		
		override getSingleElement(QualifiedName name) {
			val prefixIndex = this.segmentMap.getOrDefault(name.firstSegment, -1)
			if (prefixIndex == -1) {
				for (var i = 0; i <= this.contextName.segmentCount; i++) {
					val newName = this.contextName.skipLast(i).append(name)
					val candidate = this.globalScope.getSingleElement(newName)
					if (candidate !== null) {
						return EObjectDescription.create(name, candidate.EObjectOrProxy)
					}
				}
			} else {
				val newName = this.contextName.skipLast(this.contextName.segmentCount - prefixIndex).append(name)
				return this.globalScope.getSingleElement(newName)
			}
		}
		
		override getSingleElement(EObject object) {
			val name = this.qualifiedNameProvider.getFullyQualifiedName(object)
			if (name === null) {
				return getSingleElement(object.eContainer)
			}
			return getSingleElement(name)
		}		
	}	
}