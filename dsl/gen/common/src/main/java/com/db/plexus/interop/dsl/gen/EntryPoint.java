/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.gen;

import org.eclipse.emf.ecore.EObject;
import org.eclipse.emf.ecore.resource.Resource;

import java.util.List;

public class EntryPoint {

    private String entryName;

    private String namespace;

    private List<EObject> content;

    private Resource resource;

    public EntryPoint(String name, String namespace, List<EObject> rootModels, Resource resource) {
        this.entryName = name;
        this.content = rootModels;
        this.namespace = namespace;
        this.resource = resource;
    }

    public String getEntryName() {
        return entryName;
    }

    public List<EObject> getContent() {
        return content;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setEntryName(String entryName) {
        this.entryName = entryName;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public void setContent(List<EObject> content) {
        this.content = content;
    }

    public Resource getResource() {
        return resource;
    }
}
