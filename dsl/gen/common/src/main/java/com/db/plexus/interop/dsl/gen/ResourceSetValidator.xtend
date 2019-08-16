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
package com.db.plexus.interop.dsl.gen

import com.db.plexus.interop.dsl.gen.errors.CodeGenerationException
import com.google.inject.Inject
import java.util.ArrayList
import java.util.List
import java.util.logging.Logger
import java.util.stream.Collectors
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator
import org.eclipse.xtext.validation.Issue
import org.eclipse.xtext.EcoreUtil2

public class ResourceSetValidator {
	
    @Inject
    protected IResourceValidator validator;

    protected Logger logger = Logger.getLogger("PlexusResourceSetValidator");
		
	public def validateResources(ResourceSet resourceSet) {

        val allIssues = getValidationIssues(resourceSet)

        val errors = errors(allIssues)

        if (!errors.isEmpty()) {
            this.logger.severe(validationErrorsMessage(errors))
        }
        
        for (Issue error : errors) {
            this.logger.severe(error.toString())
        }

        val otherIssues = warnings(allIssues)

        if (!otherIssues.isEmpty()) {
            this.logger.warning(String.format("%d validation warnings found:", otherIssues.size()))
        }

        for (Issue warning : otherIssues) {
            this.logger.warning(warning.toString())
        }

        if (!errors.isEmpty()) {
            throw new CodeGenerationException(validationErrorsMessage(errors))
        }
    }

    public def getValidationIssues(ResourceSet resourceSet) {
        EcoreUtil2.resolveAll(resourceSet)
        val allIssues = new ArrayList<Issue>()
        for (Resource resource : resourceSet.getResources()) {
            val issues = validator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl)
            allIssues.addAll(issues)
        }
        return allIssues;
    }

    public def errors(List<Issue> issues) {
        issues.stream().filter[issue | issue.getSeverity() == Severity.ERROR].collect(Collectors.toList())
    }

    public def warnings(List<Issue> issues) {
        issues.stream().filter[issue | issue.getSeverity() != Severity.ERROR].collect(Collectors.toList())
    }
    
   	private def validationErrorsMessage(List<Issue> errors) {
        return String.format("%d validation errors found in loaded resources", errors.size())
    }
}