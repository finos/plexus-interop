package com.db.plexus.interop.dsl.protobuf.tests

import org.junit.runner.RunWith
import org.eclipse.xtext.testing.XtextRunner
import org.eclipse.xtext.testing.InjectWith
import com.google.inject.Inject
import com.db.plexus.interop.dsl.protobuf.ProtoLangImportResolver
import org.junit.Test
import org.eclipse.emf.common.util.URI
import org.junit.Assert

@RunWith(XtextRunner)
@InjectWith(ProtoLangInjectorProvider)
class ProtoLangImportResolverTest {

    @Inject
    ProtoLangImportResolver importResolver;

    @Test
    def testEncodeURIDeresolve() {
        val base = URI.createURI("file:///c:/projects/")
        val uri = URI.createURI("file:///c%3A/projects/path/file.interop")
        Assert.assertEquals("path/file.interop", importResolver.deresolve(base, uri).toFileString.replace("\\", "/"))
    }
}