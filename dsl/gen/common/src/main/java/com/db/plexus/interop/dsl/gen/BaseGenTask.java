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
package com.db.plexus.interop.dsl.gen;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import com.db.plexus.interop.dsl.InteropLangUtils;
import com.db.plexus.interop.dsl.gen.errors.CodeGenerationException;
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.EcoreUtil2;
import org.eclipse.xtext.resource.XtextResourceSet;

import com.db.plexus.interop.dsl.gen.util.FileUtils;
import com.google.inject.Inject;

public abstract class BaseGenTask implements GenTask {

    @Inject
    protected ResourceSetValidator validator;

    protected Logger logger = Logger.getLogger("PlexusCodeGenerator");

    private URI workingDirUri;
    private URI baseDirUri;
    private URI outDirUri;
    private URI resourceBaseUri;

    public void doGen(PlexusGenConfig config) throws IOException, URISyntaxException {
    	this.workingDirUri = getWorkingDir();
        this.baseDirUri = getRelativeURI(config.getBaseDir(), this.workingDirUri);
        this.outDirUri = getRelativeURI(config.getOutDir(), this.workingDirUri);
        this.resourceBaseUri = detectResourceBaseUri();
        final XtextResourceSet resourceSet = new XtextResourceSet();
        loadResources(resourceSet, getBaseDirUri(), config.isVerbose(), inputFilesGlob(config));
        if (config.isVerbose()) {
            printResources(resourceSet);
        }
        validateResources(config, resourceSet);
        doGenWithResources(config, resourceSet);
    }

    protected String inputFilesGlob(PlexusGenConfig config) {
        return config.getInput();
    }

    protected URI getWorkingDir() {
        return URI.createFileURI(Paths.get("").toAbsolutePath().toString()).appendSegment("");
    }

    public void printResources(XtextResourceSet resourceSet) {
        resourceSet.getResources().forEach(r ->  this.logger.info("Loaded resource: " + r.getURI()));
    }

    public void validateResources(PlexusGenConfig config, XtextResourceSet resourceSet) {
        this.validator.validateResources(resourceSet);
    }

    public void validateInteropResourceLoaded(PlexusGenConfig config, XtextResourceSet resourceSet) {
        boolean containsInterop = resourceSet.getResources().stream().anyMatch(r -> r.getURI().toString().endsWith(".interop"));
        if (!containsInterop) {
            String errorMessage = String.format("No *.interop files match provided [%s] criteria, please check your input arguments.", config.getInput());
            this.logger.severe(errorMessage);
            throw new CodeGenerationException(errorMessage);
        }
    }

    protected void doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException {}

    protected URI getWorkingDirUri() {
        return workingDirUri;
    }

    protected URI getBaseDirUri() {
        return baseDirUri;
    }

    protected URI getOutDirUri() {
        return outDirUri;
    }

    protected URI getResourceBaseUri() {
        return resourceBaseUri;
    }

    protected String getAbsolutePath(String relativePath) {
        return Paths.get(".").resolve(relativePath).toAbsolutePath().toString();
    }

    protected List<String> getProtoFilePaths(EList<Resource> resources, PlexusGenConfig config) {
        final String excludePattern = config.getExcludePattern();
        final boolean excludePatternIsEmpty = excludePattern == null || excludePattern.trim().isEmpty();
        return resources.stream()
                .filter(x -> x.getURI().lastSegment().endsWith(".proto"))
                .filter(x -> config.isIncludeProtoDescriptors() || !x.getURI().toString().endsWith(ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH))
                .filter(x -> excludePatternIsEmpty || !x.getURI().toString().matches(excludePattern))
                .filter(x -> config.isIncludeProtoDescriptors() || !x.getURI().toString().endsWith(InteropLangUtils.DESCRIPTOR_RESOURCE_PATH))
                .filter(x -> x.getURI().toFileString() != null)
                .map(resource -> new File(resource.getURI().resolve(workingDirUri).toFileString()).getAbsolutePath())
                .collect(Collectors.toList());
    }

    protected void loadResources(XtextResourceSet resourceSet, URI baseDirUri, boolean isVerbose, String inputGlob) throws IOException {
        FileUtils.processFiles(
                new File(baseDirUri.toFileString()).getPath(),
                inputGlob,
                path -> {
                    if (isVerbose) {
                        this.logger.info("Loading file: " + path.toAbsolutePath());
                    }
                    loadResource(path, resourceSet);
                });
        EcoreUtil2.resolveAll(resourceSet);
    }

    private void loadResource(Path path, XtextResourceSet resourceSet) {
    	URI uri = URI.createFileURI(path.toString());
    	resourceSet.getResource(uri, true);
    }

    protected URI getRelativeURI(String path, URI workingDirURI) {
        URI uri = URI.createFileURI(path).resolve(workingDirURI);
        if (!uri.lastSegment().equals("")) {
            uri = uri.appendSegment("");
        }
        return uri;
    }

    protected URI detectResourceBaseUri() throws URISyntaxException {
    	URI commonUri;
    	commonUri = URI.createURI(
    			ClassLoader.getSystemClassLoader().getResource("interop/options.proto").toURI().toString());
    	URI resourceBaseUri = commonUri.trimSegments(2).appendSegment("");
    	return resourceBaseUri;
    }

    protected void writeToFile(String outPath, String content) throws IOException {
        this.logger.info("Saving to: " + outPath);
        FileUtils.writeStringToFile(new File(outPath), content);
    }

    protected int generateMessages(List<String> args) throws IOException {
        this.logger.info(String.format("Running compiler with args [%s]", String.join(" ", args)));
        try {
            final int resultCode = new ProcessBuilder(args)
                    .inheritIO()
                    .start()
                    .waitFor();
            if (resultCode != 0) {
                this.logger.log(Level.WARNING, "Compiler has returned non-zero result code " + resultCode);
            }
            return resultCode;
        } catch (Exception e) {
            this.logger.log(Level.WARNING, "Could not generate messages definitions");
            e.printStackTrace();
            return 1;
        }
    }

}
