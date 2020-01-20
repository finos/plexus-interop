/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.protobuf.server;

import com.google.inject.AbstractModule;
import org.eclipse.xtext.ide.ExecutorServiceProvider;
import org.eclipse.xtext.ide.server.*;
import org.eclipse.xtext.resource.IContainer;
import org.eclipse.xtext.resource.IResourceServiceProvider;
import org.eclipse.xtext.resource.ResourceServiceProviderServiceLoader;
import org.eclipse.xtext.resource.containers.ProjectDescriptionBasedContainerManager;

import java.util.concurrent.ExecutorService;

public class ProtoLangServerModule extends AbstractModule {

    protected void configure() {
        this.binder().bind(ExecutorService.class).toProvider(ExecutorServiceProvider.class);
        this.bind(LanguageServerImpl.class).to(ProtoLanguageServer.class);
        this.bind(IResourceServiceProvider.Registry.class).toProvider(ResourceServiceProviderServiceLoader.class);
        this.bind(IWorkspaceConfigFactory.class).to(ProjectWorkspaceConfigFactory.class);
        this.bind(IProjectDescriptionFactory.class).to(DefaultProjectDescriptionFactory.class);
        this.bind(IContainer.Manager.class).to(ProjectDescriptionBasedContainerManager.class);
    }

}
