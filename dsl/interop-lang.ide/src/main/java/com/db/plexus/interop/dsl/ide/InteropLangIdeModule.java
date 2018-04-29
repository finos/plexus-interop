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
package com.db.plexus.interop.dsl.ide;

import com.db.plexus.interop.dsl.ide.assist.InteropContentProposalProvider;
import com.db.plexus.interop.dsl.ide.assist.InteropCrossRefProposalProvider;
import com.google.inject.Binder;
import org.eclipse.xtext.ide.editor.contentassist.IdeContentProposalProvider;
import org.eclipse.xtext.ide.editor.contentassist.IdeCrossrefProposalProvider;

/**
 * Use this class to register custom ide components.
 */
public class InteropLangIdeModule extends AbstractInteropLangIdeModule {

    /**
     * It is used, please do not delete, Xtext like reflection a lot
     */
    public void configureContentAssistProvider(Binder binder) {
        binder.bind(IdeContentProposalProvider.class)
                .to(InteropContentProposalProvider.class);
    }

    /**
     * It is used also
     */
    public void configureCrossRefProposalProvider(Binder binder) {
        binder.bind(IdeCrossrefProposalProvider.class).to(InteropCrossRefProposalProvider.class);
    }

}
