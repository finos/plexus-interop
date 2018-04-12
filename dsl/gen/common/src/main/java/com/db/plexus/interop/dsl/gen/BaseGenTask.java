/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.common.util.URI;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.EcoreUtil2;
import org.eclipse.xtext.resource.XtextResourceSet;

import com.db.plexus.interop.dsl.gen.util.FileUtils;
import com.google.inject.Inject;

public abstract class BaseGenTask implements GenTask {
    
    private XtextResourceSet resourceSet = new XtextResourceSet();

    @Inject
    protected ResourceSetValidator validator;

    protected Logger logger = Logger.getLogger("PlexusCodeGenerator");

    private URI workingDirUri;
    private URI baseDirUri;
    private URI outDirUri;
    private URI resourceBaseUri;
        
    protected String inputFilesGlob(PlexusGenConfig config) {
        return config.getInput();
    }

    public void doGen(PlexusGenConfig config) throws IOException, URISyntaxException {    	    	
    	this.workingDirUri = URI.createFileURI(Paths.get("").toAbsolutePath().toString()).appendSegment("");
        this.baseDirUri = getBaseDirUri(config);
        this.outDirUri = getOutDirUri(config);
        this.resourceBaseUri = getResourceBaseUri(config);
        loadResources(config);
        this.validator.validateResources(resourceSet);
        doGenWithResources(config, this.resourceSet);
    }

    protected abstract void doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException;

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
        return resources.stream()
                .filter(x -> x.getURI().lastSegment().endsWith(".proto"))
                .filter(x -> config.isIncludeProtoDescriptors() || !x.getURI().toString().endsWith(ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH))
                .filter(x -> config.isIncludeProtoDescriptors() || !x.getURI().toString().endsWith(InteropLangUtils.DESCRIPTOR_RESOURCE_PATH))
                .filter(x -> x.getURI().toFileString() != null)
                .map(resource -> new File(resource.getURI().resolve(workingDirUri).toFileString()).getAbsolutePath())
                .collect(Collectors.toList());
    }

    protected void loadResources(PlexusGenConfig config) throws IOException {
        FileUtils.processFiles(
                new File(this.getBaseDirUri().toFileString()).getPath(),
                this.inputFilesGlob(config),
                (path) -> loadResource(path));
        EcoreUtil2.resolveAll(resourceSet);
    }
    
    private void loadResource(Path path) {
    	URI uri = URI.createFileURI(path.toString());
    	this.logger.info("Loading file: " + uri);
    	resourceSet.getResource(uri, true);
    }

    private URI getBaseDirUri(PlexusGenConfig config) {
        URI uri = URI.createFileURI(config.getBaseDir()).resolve(workingDirUri);
        if (!uri.lastSegment().equals("")) {
        	uri = uri.appendSegment("");
        }
        return uri;
    }

    private URI getOutDirUri(PlexusGenConfig config) {
        URI uri = URI.createFileURI(config.getOutDir()).resolve(workingDirUri);
        if (!uri.lastSegment().equals("")) {
        	uri = uri.appendSegment("");
        }
        return uri;
    }
    
    private URI getResourceBaseUri(PlexusGenConfig config) throws URISyntaxException {
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
