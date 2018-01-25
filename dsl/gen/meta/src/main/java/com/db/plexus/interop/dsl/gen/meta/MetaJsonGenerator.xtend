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
package com.db.plexus.interop.dsl.gen.meta

import com.db.plexus.interop.dsl.gen.CodeOutputGenerator
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import org.eclipse.emf.ecore.resource.Resource
import static extension com.db.plexus.interop.dsl.gen.InteropLangUtils.*
import org.eclipse.xtext.naming.IQualifiedNameProvider
import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import java.util.List

class MetaJsonGenerator implements CodeOutputGenerator {
	
	@Inject
	IQualifiedNameProvider qualifiedNameProvider
	
	def fullName(EObject obj) {
		return qualifiedNameProvider.getFullyQualifiedName(obj).skipFirst(1).toString()
	}
	
    override def generate(PlexusGenConfig genConfig, List<Resource> resources) {
        println("Generating interop meta JSON")
        '''
		{
		    "messages": [
		    	«FOR message : resources.messages SEPARATOR ','»
		    	{
					"id": "«message.fullName»",
					"fields": [
						«FOR field: message.fields SEPARATOR ','»
						{
							"name": "«field.name»",
							"num": «field.number»,
							"primitive": «field.isPrimitive»,
							"type": "«getType(field, qualifiedNameProvider)»"
						}
        				«ENDFOR»
					]
				}
		    	«ENDFOR»
		    ],
			"services": [
				«FOR service : resources.services SEPARATOR ','»
				{
					"id": "«service.fullName»",
					"methods": [
						«FOR method: service.methods SEPARATOR ','»
						{
							"name": "«method.name»",
							"input": "«method.request.message.fullName»",
							"output": "«method.response.message.fullName»",
							"type": "«method.type»"
						}
        				«ENDFOR»
					]
				}
				«ENDFOR»
			],
			"applications": [
				«FOR application : resources.applications SEPARATOR ','»
				{
					"id": "«application.fullName»",
					"consumes": [
						«FOR consumedService : application.consumedServices SEPARATOR ','»        				
						{
							"service": "«consumedService.service.fullName»",
							"from": [
								«FOR restriction : consumedService.wildcards SEPARATOR ','»
									"«restriction»"
        						«ENDFOR»
							],
							"methods": [
								«FOR consumedMethod : consumedService.methods SEPARATOR ','»
									"«consumedMethod.method.name»"
								«ENDFOR»
							]
						}
				       «ENDFOR»        			
				     ],
				     "provides": [
				     	«FOR providedService : application.providedServices SEPARATOR ','»
				     	{
				     		"service": "«providedService.service.fullName»",
				     		"title": "«providedService.title»",
				     		"to": [
				     			«FOR restriction : providedService.wildcards SEPARATOR ','»
				     			"«restriction»"
				     			«ENDFOR»
				     		],
				     		"methods": [
				     			«FOR providedMethod : providedService.methods SEPARATOR ','»
				     			{
				     				"name": "«providedMethod.method.name»",
				     				"title": "«providedMethod.title»"
				     			}
				     			«ENDFOR»
				     		]
				     	}
				     	«ENDFOR»
				     ]
				  }
				  «ENDFOR»
			]
		}
		'''
    }
}