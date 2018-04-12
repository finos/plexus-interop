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
package com.db.plexus.interop.dsl.gen.file;

import com.google.inject.Inject;
import com.google.inject.Provider;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.resource.XtextResourceSet;

import java.nio.file.Path;

public class PlexusModelLoader {

    private final Provider<XtextResourceSet> resourceSetProvider;

    @Inject
    public PlexusModelLoader(Provider<XtextResourceSet> resourceSetProvider) {
        this.resourceSetProvider = resourceSetProvider;
    }

    public Resource loadFromPath(Path path) {
        return resourceSetProvider.get().getResource(toUri(path.toString()), true);
    }

    private URI toUri(String entryPointFile) {
        return URI.createFileURI(entryPointFile);
    }

}
