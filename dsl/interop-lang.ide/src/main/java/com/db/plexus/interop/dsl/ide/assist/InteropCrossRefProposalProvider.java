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
package com.db.plexus.interop.dsl.ide.assist;

import com.db.plexus.interop.dsl.protobuf.impl.MethodImpl;
import org.eclipse.emf.ecore.EClass;
import org.eclipse.xtext.CrossReference;
import org.eclipse.xtext.ide.editor.contentassist.ContentAssistContext;
import org.eclipse.xtext.ide.editor.contentassist.ContentAssistEntry;
import org.eclipse.xtext.ide.editor.contentassist.IdeCrossrefProposalProvider;
import org.eclipse.xtext.resource.IEObjectDescription;
import org.eclipse.xtext.xbase.lib.Procedures;

public class InteropCrossRefProposalProvider extends IdeCrossrefProposalProvider {

    @Override
    protected ContentAssistEntry createProposal(IEObjectDescription candidate, CrossReference crossRef, ContentAssistContext context) {
        final Procedures.Procedure1<ContentAssistEntry> entryInitHandler = entry -> {
            entry.setSource(candidate);
            EClass eClass = candidate.getEClass();
            entry.setDescription(eClass != null ? eClass.getName() : null);
        };
        final boolean isMethodImpl = candidate.getEObjectOrProxy() instanceof MethodImpl;
        final String name = isMethodImpl ? candidate.getName().getLastSegment() : getQualifiedNameConverter().toString(candidate.getName());
        return this.getProposalCreator()
                .createProposal(name, context, entryInitHandler);

    }
}
