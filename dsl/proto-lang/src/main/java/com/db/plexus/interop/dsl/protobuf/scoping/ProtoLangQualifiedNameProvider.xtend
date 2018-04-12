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
package com.db.plexus.interop.dsl.protobuf.scoping

import com.db.plexus.interop.dsl.protobuf.Package
import com.db.plexus.interop.dsl.protobuf.Proto
import com.google.inject.Inject
import java.util.LinkedList
import org.eclipse.xtext.naming.DefaultDeclarativeQualifiedNameProvider
import org.eclipse.xtext.naming.IQualifiedNameConverter
import org.eclipse.xtext.naming.QualifiedName

class ProtoLangQualifiedNameProvider extends DefaultDeclarativeQualifiedNameProvider {
	
	@Inject
	private IQualifiedNameConverter converter = new IQualifiedNameConverter.DefaultImpl();
		
	def qualifiedName(Proto ele) {
		val packageSegments = new LinkedList<String>()
		packageSegments.add("")
		val package = ele.eContents.findFirst[t|t instanceof Package]
		if (package !== null) {
			packageSegments.addAll(converter.toQualifiedName((package as Package).importedNamespace).segments)			
		}
		return QualifiedName.create(packageSegments);		
	}
}
		