/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.ide.assist;

import com.db.plexus.interop.dsl.protobuf.ProtoLangImportResolver;
import com.google.inject.Inject;
import org.eclipse.xtext.AbstractElement;
import org.eclipse.xtext.Assignment;
import org.eclipse.xtext.ide.editor.contentassist.ContentAssistContext;
import org.eclipse.xtext.ide.editor.contentassist.ContentAssistEntry;
import org.eclipse.xtext.ide.editor.contentassist.IIdeContentProposalAcceptor;
import org.eclipse.xtext.ide.editor.contentassist.IdeContentProposalProvider;
import org.eclipse.xtext.impl.RuleCallImpl;

public class ImportContentProvider extends IdeContentProposalProvider {

    @Inject
    private ProtoLangImportResolver importResolver;

    @Override
    protected void _createProposals(Assignment assignment, ContentAssistContext context, IIdeContentProposalAcceptor acceptor) {
        final AbstractElement terminal = assignment.getTerminal();
        if (terminal instanceof RuleCallImpl) {
            final String feature = assignment.getFeature();
            final String operator = assignment.getOperator();
            if ("importURI".equals(feature) && "=".equals(operator)) {
                importResolver.importCandidates(context.getResource())
                        .stream()
                        .map(uri -> uri.toFileString().replace("\\", "/"))
                        .map(uriString -> "\"" + uriString + "\"")
                        .forEach(value -> {
                            final ContentAssistEntry proposal = getProposalCreator()
                                    .createProposal(value, context);
                            acceptor.accept(proposal, getProposalPriorities().getDefaultPriority(proposal));
                        });
                return;
            }
        }
        super._createProposals(assignment, context, acceptor);
    }

}
