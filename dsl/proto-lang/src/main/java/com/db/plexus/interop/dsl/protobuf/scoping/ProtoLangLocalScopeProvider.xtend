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
	
	def override List<ImportNormalizer> internalGetImportedNamespaceResolvers(EObject context, boolean ignoreCase) {
		if (context instanceof Proto) {
			val packageName = getQualifiedNameProvider().getFullyQualifiedName(context)
			val segments = packageName.segments
			val result = new LinkedList<ImportNormalizer>()			
			for (var i = 1; i <= segments.length; i++) {
				var subPackage = QualifiedName.create(segments.subList(0, i))
				result.add(new ImportNormalizer(subPackage, true, false))			
			}
			return result;						
		}				
		return empty
	}
}