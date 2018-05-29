package com.db.plexus.interop.dsl.validation.rules

import org.eclipse.xtext.resource.XtextResourceSet
import com.db.plexus.interop.dsl.gen.test.ResourceUtils
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.*;
import org.eclipse.xtext.EcoreUtil2

class BaseRuleTest {

    def testFalsePositive(UpdateRule rule) {
        val resourceSet = new XtextResourceSet()
        resourceSet.getResource(ResourceUtils.resolveURI("com/db/plexus/interop/dsl/gen/test/components/component_a.interop"), true)
        EcoreUtil2.resolveAll(resourceSet)
        assertThat(rule.validate(resourceSet, resourceSet), hasSize(0))
    }
}