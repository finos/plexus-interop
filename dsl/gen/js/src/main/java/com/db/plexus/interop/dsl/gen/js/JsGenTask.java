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
package com.db.plexus.interop.dsl.gen.js;

import com.db.plexus.interop.dsl.Application;
import com.db.plexus.interop.dsl.InteropLangUtils;
import com.db.plexus.interop.dsl.gen.BaseGenTask;
import com.db.plexus.interop.dsl.gen.GenUtils;
import com.db.plexus.interop.dsl.gen.PlexusGenConfig;
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils;
import com.google.inject.Inject;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.xtext.resource.XtextResourceSet;

import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Named
public class JsGenTask extends BaseGenTask {

    public static final String PROTO_JS_COMPILER = "pbjs";
    public static final String PROTO_JS_COMPILER_CMD = "pbjs.cmd";
    public static final String PLEXUS_MESSAGES_MODULES = "plexus-messages";

    @Inject
    private JsComponentApiGenerator codeOutputGenerator;

    @Override
    protected void doGenWithResources(PlexusGenConfig config, XtextResourceSet rs) throws IOException {
    	
    	EList<Resource> resources = rs.getResources();

        String pbJsPath = null;

        final String configProtocPath = config.getProtocPath();
        if (configProtocPath == null || configProtocPath.isEmpty()) {
            this.logger.info("Proto compiler not provided, messages generation will be skipped");
        } else if (!configProtocPath.endsWith(PROTO_JS_COMPILER)
                && !configProtocPath.endsWith(PROTO_JS_COMPILER_CMD)) {
            this.logger.warning("Only pbjs compiler supported, messages generation will be skipped");
        } else {
            pbJsPath = configProtocPath;
        }

        final List<String> protoFilePaths = resources.stream()
        		.filter(x -> x.getURI().lastSegment().endsWith(".proto"))
        		.filter(x -> !x.getURI().toString().endsWith(ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH))
        		.filter(x -> !x.getURI().toString().endsWith(InteropLangUtils.DESCRIPTOR_RESOURCE_PATH))        		
                .map(resource -> new File(resource.getURI().toFileString()).getAbsolutePath())                
                .collect(Collectors.toList());

        final String outDirPath = this.getAbsolutePath(config.getOutDir());

        if (protoFilePaths.isEmpty()) {
            this.logger.warning("No proto resources detected");
        }

        if (pbJsPath != null) {
            this.logger.info("Using " + pbJsPath + " to generate JS messages");
            final List<String> pbJsArgs = new ArrayList<>(Arrays.asList(pbJsPath));
            pbJsArgs.addAll(jsProtoArgs(config, outDirPath));
            pbJsArgs.addAll(protoFilePaths);
            final int resultCode = generateMessages(pbJsArgs);
            if (resultCode == 0) {
                this.logger.info("Generated successfully");
            }
        }

        final List<Application> applications = GenUtils.getApplications(resources.toArray(new Resource[]{}));

        config.setExternalDependencies(Arrays.asList("./" + PLEXUS_MESSAGES_MODULES));

        for (Application application : applications) {
            this.logger.info("Generating JS Client for " + application.getName());
            String stringContent = codeOutputGenerator.generate(config, application, resources);
            this.logger.info("Generated successfully");
            writeToFile(config.getOutDir() + "/" + application.getName() + "GeneratedClient.js", stringContent);
        }

    }

    private List<String> jsProtoArgs(PlexusGenConfig config, String outDirPath) {
        return Arrays.asList(
                "--force-long",
                "-t", "static-module",
                "-r", config.getNamespace(),
                "-w", "commonjs",
                "-o", outDirPath + File.separator + PLEXUS_MESSAGES_MODULES + ".js");
    }
}
