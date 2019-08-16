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
package com.db.plexus.interop.dsl.ide.server;

import com.db.plexus.interop.dsl.GlobalLangConfigHolder;
import org.eclipse.emf.common.util.URI;
import org.eclipse.lsp4j.InitializeParams;
import org.eclipse.lsp4j.InitializeResult;
import org.eclipse.xtext.ide.server.LanguageServerImpl;

import java.util.concurrent.CompletableFuture;

public class InteropLanguageServer extends LanguageServerImpl {

    @Override
    public CompletableFuture<InitializeResult> initialize(InitializeParams params) {
        final String rootUri = params.getRootUri();
        if (rootUri != null) {
            GlobalLangConfigHolder.interopLangConfig.addBaseURI(stringToUri(rootUri));
            GlobalLangConfigHolder.protoLangConfig.addBaseURI(stringToUri(rootUri));
        }
        return super.initialize(params);
    }

    private URI stringToUri(String rootUri) {
        // URI.createUri contains confusing logic to remove last segment if string doesn't have separator at the end
        final String normalized = rootUri.endsWith("/") ? rootUri : rootUri + "/";
        return URI.createURI(normalized);
    }
}
