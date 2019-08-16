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
package com.db.plexus.interop.dsl.validation.rules

import com.db.plexus.interop.dsl.gen.GenUtils
import com.google.inject.Inject
import org.eclipse.xtext.resource.XtextResourceSet
import static com.db.plexus.interop.dsl.validation.Issues.*;
import com.db.plexus.interop.dsl.protobuf.Field
import com.db.plexus.interop.dsl.protobuf.PrimitiveFieldType
import com.db.plexus.interop.dsl.protobuf.ComplexFieldType

class NoFieldsChangedRule implements UpdateRule {

    val GenUtils genUtils;

    @Inject
    new(GenUtils genUtils) {
        this.genUtils = genUtils;
    }

    override getCode() '''message-field-updated'''

    override validate(XtextResourceSet baseResourceSet, XtextResourceSet updatedResourceSet) {
        val baseFields = genUtils.getFieldsMap(baseResourceSet.resources)
        val updatedFields = genUtils.getFieldsMap(updatedResourceSet.resources)
        val updatedFieldIds = updatedFields.keySet;
        return baseFields.entrySet
        .filter[fieldEntry | updatedFieldIds.contains(fieldEntry.key)]
        .filter[fieldEntry | !fieldsEqual(fieldEntry.value, updatedFields.get(fieldEntry.key))]
        .map([fieldEntry | createError('''Message field «fieldEntry.key» updated''', getCode)])
        .toList()
    }

    def fieldsEqual(Field first, Field second) {
        if (!first.number.equals(second.number)) {
            return false
        }
        val labelsEqual = (first.label === null && second.label === null)
            || (first.label.equals(second.label));
        if (!labelsEqual) {
            return false
        }
        val firstType = first.typeReference
        val secondType = second.typeReference
        if (!firstType.class.equals(secondType.class)) {
            return false
        }
        switch (firstType) {
            PrimitiveFieldType: return firstType.value.equals((secondType as PrimitiveFieldType).value),
            ComplexFieldType: return complexTypesEqual(firstType, secondType as ComplexFieldType)
        }
    }

    def complexTypesEqual(ComplexFieldType first, ComplexFieldType second) {
        if (!first.class.equals(second.class)) {
            return false;
        }
        return genUtils.getFullName(first.value)
                .equals(genUtils.getFullName(second.value));
    }

}