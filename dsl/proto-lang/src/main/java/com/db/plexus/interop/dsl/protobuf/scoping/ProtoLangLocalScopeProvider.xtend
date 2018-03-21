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
package com.db.plexus.interop.dsl.protobuf.scoping

import org.eclipse.xtext.scoping.impl.ImportedNamespaceAwareLocalScopeProvider
import java.util.List
import org.eclipse.xtext.scoping.impl.ImportNormalizer
import org.eclipse.xtext.naming.QualifiedName
import java.util.LinkedList
import org.eclipse.xtext.scoping.IGlobalScopeProvider
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.scoping.ICaseInsensitivityHelper
import org.eclipse.xtext.naming.IQualifiedNameConverter
import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import com.db.plexus.interop.dsl.protobuf.Proto
import org.eclipse.xtext.scoping.IScope
import org.eclipse.emf.ecore.EReference
import org.eclipse.xtext.scoping.Scopes
import org.eclipse.xtext.resource.EObjectDescription
import org.eclipse.xtext.scoping.impl.SimpleScope
import org.eclipse.xtext.resource.IEObjectDescription
import java.util.ArrayList
import java.util.HashSet

class ProtoLangLocalScopeProvider extends ImportedNamespaceAwareLocalScopeProvider {
	
	private final List<ImportNormalizer> empty = new LinkedList<ImportNormalizer>()
	 
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
	
//	def override List<ImportNormalizer> internalGetImportedNamespaceResolvers(EObject context, boolean ignoreCase) {
//		if (context instanceof Proto) {
//			val packageName = getQualifiedNameProvider().getFullyQualifiedName(context)
//			val segments = packageName.segments
//			val result = new LinkedList<ImportNormalizer>()			
//			for (var i = 1; i <= segments.length; i++) {
//				var subPackage = QualifiedName.create(segments.subList(0, i))
//				result.add(new ImportNormalizer(subPackage, true, false))			
//			}			
//			return result;						
//		}				
//		return empty
//	}
	
	def override getLocalElementsScope(IScope parent, EObject context, EReference reference) {
		val fqn = qualifiedNameProvider.getFullyQualifiedName(context)
		if (fqn === null) {
			return parent
		}				
		if (context instanceof Proto) {
			val list = new ArrayList<IEObjectDescription>()
			val hashSet = new HashSet<String>()
			var rootElements = parent.allElements
			for (var i = 0; i < fqn.segmentCount; i--) {
				val prefix = fqn.skipLast(i)
				hashSet.add(prefix.lastSegment)
				list.addAll(rootElements.filter[x | x.name.segmentCount > prefix.segmentCount && !hashSet.contains(x.name.getSegment(prefix.segmentCount)) && x.name.startsWith(fqn)]) 				
			}
			return new SimpleScope(list)
		} else {
			val index = fqn.segments.indexOf(fqn.lastSegment)
			if (index < fqn.segmentCount - 1) {
				val allElements = excludeFirstSegment(parent.allElements, fqn.lastSegment)
				val result = super.getLocalElementsScope(new SimpleScope(allElements), context, reference)
				return result
			}
		}				
	}
	
	def private excludeFirstSegment(Iterable<IEObjectDescription> scope, String excludedFirstSegment, QualifiedName fqnPrefix) {
		return scope.filter[x | !x.name.firstSegment.equals(excludedFirstSegment) || !qualifiedNameProvider.getFullyQualifiedName(x.EObjectOrProxy).startsWith(fqnPrefix)]
	}	
	
	def private excludeFirstSegment(Iterable<IEObjectDescription> scope, String excludedFirstSegment) {
		return scope.filter[x | !x.name.firstSegment.equals(excludedFirstSegment)]
	}
	
//	def override getLocalElementsScope(IScope parent, EObject context, EReference reference) {
//		
//		val fqn = qualifiedNameProvider.getFullyQualifiedName(context)
//		if (fqn === null) {
//			return parent
//		}
//		
//		var newScope = parent
//				
//		if (context instanceof Proto) {
//			for (var i = 2; i < fqn.segmentCount; i++) {
//				newScope = getLocalElementScope(newScope, fqn.skipLast(fqn.segmentCount - i))
//			}
//		}
//				
//		newScope = getLocalElementScope(newScope, fqn)
//		
//		return newScope
//	}
//	
//	def private getLocalElementScope(IScope parent, QualifiedName context) {
//		if (context === null) {
//			return parent
//		}
//		
//		var result = new SimpleScope(parent.allElements.filter[x | !x.name.firstSegment.equals(context.lastSegment)].toList)		
//		if (context.segmentCount > 1) {
//			val prevLastSegment = context.getSegment(context.segmentCount - 2)
//			var newElems = parent.allElements
//				.filter[x | x.name.segmentCount > 1 && x.name.firstSegment.equals(prevLastSegment)]
//				.map[x | EObjectDescription.create(x.name.skipFirst(1), x.EObjectOrProxy)]
//				.toList
//			result = new SimpleScope(result, newElems)
//		}
//		return result
//			
//	}
}