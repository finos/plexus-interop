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
import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import java.util.List
import static extension com.db.plexus.interop.dsl.gen.GenUtils.*
import com.db.plexus.interop.dsl.gen.GenUtils
import com.db.plexus.interop.dsl.protobuf.Option

class MetaJsonGenerator extends CodeOutputGenerator {
		
	@Inject
	GenUtils utils
	
	def fullName(EObject obj) {
		return utils.getFullName(obj)
	}
	
	def generateOptionsField(List<Option> options) {
		'''
		"options": [
			«FOR option : options SEPARATOR ','»
			{
				"id": "«option.descriptor.fullName»",
				"value": "«option.valueAsString»"
			}
			«ENDFOR»
		]
		'''
	}
	
    protected override def generate(PlexusGenConfig genConfig, List<Resource> resources) {
        println("Generating interop meta JSON")
        '''
		{
			"messages": «genConfig.messagesMetadata»,
			"services": [
				«FOR service : resources.services SEPARATOR ','»
				{
					"id": "«service.fullName»",
					"methods": [
						«FOR method: service.methods SEPARATOR ','»
						{
							"name": "«method.name»",
							"request": "«method.request.message.fullName»",
							"response": "«method.response.message.fullName»",
							"type": "«method.type»"«IF method.optionList.length > 0»,
							«generateOptionsField(method.optionList)»«ENDIF»
						}
        				«ENDFOR»
					]«IF service.optionList.length > 0»,
					«generateOptionsField(service.optionList)»«ENDIF»
				}
				«ENDFOR»
			],
			"applications": [
				«FOR application : resources.applications SEPARATOR ','»
				{
					"id": "«application.fullName»"«IF application.optionList.length > 0»,
					«generateOptionsField(application.optionList)»«ENDIF»«IF application.consumedServices.length > 0»,
					"consumes": [
						«FOR consumedService : application.consumedServices SEPARATOR ','»        				
						{
							"service": "«consumedService.service.fullName»",
							"methods": [
								«FOR consumedMethod : consumedService.methods SEPARATOR ','»
								{
									"name": "«consumedMethod.method.name»"«IF consumedMethod.optionList.length > 0»,
									«generateOptionsField(consumedMethod.optionList)»«ENDIF»
								}
								«ENDFOR»
							]«IF consumedService.alias !== null»,
							"alias": "«consumedService.alias»"«ENDIF»«IF consumedService.wildcards.length > 0»,
							"from": [
								«FOR restriction : consumedService.wildcards SEPARATOR ','»
									"«restriction»"
        						«ENDFOR»
							]«ENDIF»«IF consumedService.optionList.length > 0»,
							«generateOptionsField(consumedService.optionList)»«ENDIF»
						}
						«ENDFOR»
					]«ENDIF»«IF application.providedServices.length > 0»,
					"provides": [
						«FOR providedService : application.providedServices SEPARATOR ','»
						{
							"service": "«providedService.service.fullName»",
							"methods": [
								«FOR providedMethod : providedService.methods SEPARATOR ','»
								{
									"name": "«providedMethod.method.name»"«IF providedMethod.optionList.length > 0»,
									«generateOptionsField(providedMethod.optionList)»«ENDIF»
								}
								«ENDFOR»
							]«IF providedService.alias !== null»,
							"alias": "«providedService.alias»"«ENDIF»«IF providedService.wildcards.length > 0»,
							"to": [
								«FOR restriction : providedService.wildcards SEPARATOR ','»
								"«restriction»"
								«ENDFOR»
							]«ENDIF»«IF providedService.optionList.length > 0»,
							«generateOptionsField(providedService.optionList)»«ENDIF»
						}
						«ENDFOR»
					]«ENDIF»
				}
				«ENDFOR»
			]
		}
		'''
    }
}