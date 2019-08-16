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
/*
 * generated by Xtext 2.12.0
 */
package com.db.plexus.interop.dsl.protobuf.formatting2

import com.db.plexus.interop.dsl.protobuf.Proto
import org.eclipse.xtext.formatting2.AbstractFormatter2
import org.eclipse.xtext.formatting2.IFormattableDocument

class ProtoLangFormatter extends AbstractFormatter2 {
	
	def dispatch void format(Proto proto, extension IFormattableDocument document) {		
		for (o : proto.eResource.allContents.toIterable()) {
			o.allRegionsFor.keyword('{').append[setNewLines(1, 1, 2)]					
			o.allRegionsFor.keyword('}').append[setNewLines(2, 2, 2)]		
			o.allRegionsFor.keyword(';').prepend[noSpace].append[setNewLines(1, 1, 2)]			
			val open = o.regionFor.keyword('{')
			val close = o.regionFor.keyword('}')
			interior(open, close)[indent]
		}
	}
}
