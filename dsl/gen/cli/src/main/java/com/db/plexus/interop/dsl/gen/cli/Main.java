/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl.gen.cli;

import com.db.plexus.interop.dsl.InteropLangStandaloneSetup;
import com.db.plexus.interop.dsl.gen.ApplicationCodeGenerator;
import com.db.plexus.interop.dsl.gen.CodeOutputGenerator;
import com.db.plexus.interop.dsl.gen.GenTask;
import com.db.plexus.interop.dsl.gen.PlexusGenConfig;
import com.db.plexus.interop.dsl.gen.js.JsGenTask;
import com.db.plexus.interop.dsl.gen.csharp.CsharpGenTask;
import com.db.plexus.interop.dsl.gen.csharp.CsharpProtoGenTask;
import com.db.plexus.interop.dsl.gen.meta.MetaJsonGenTask;
import com.db.plexus.interop.dsl.gen.ts.TsGenTask;
import com.db.plexus.interop.dsl.gen.proto.ProtoGenTask;
import com.db.plexus.interop.dsl.gen.util.FileUtils;
import com.google.inject.Injector;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

import org.eclipse.emf.common.util.URI;

public class Main {

    private static Logger log = Logger.getLogger("Generator");

    public static void main(String[] args) throws IOException, URISyntaxException {
        System.setProperty("java.util.logging.SimpleFormatter.format",
                "[%1$tF %1$tT] [%4$-7s] %5$s %n");
        final PlexusGenConfig genConfig = new ParametersParser().parse(args);
        log.info("Running generator with parameters: " + genConfig.toString());
        Path workDirPath = Paths.get("").toAbsolutePath();
        URI workDir = URI.createFileURI(workDirPath.toString()).appendSegment("");
        URI baseDir = URI.createFileURI(genConfig.getBaseDir()).resolve(workDir).appendSegment("");
        final InteropLangStandaloneSetup setup = new InteropLangStandaloneSetup();
        final Injector injector = setup.createInjectorAndDoEMFRegistration();
        setup.addBaseURI(baseDir);
        final String type = genConfig.getType();
        switch (type) {
            case ApplicationCodeGenerator.TS:
                GenTask tsGenTask = injector.getInstance(TsGenTask.class);
                tsGenTask.doGen(genConfig);
                break;
            case ApplicationCodeGenerator.JS:
                GenTask jsGenTask = injector.getInstance(JsGenTask.class);
                jsGenTask.doGen(genConfig);
                break;
            case CodeOutputGenerator.JSON_META:
                genConfig.setIncludeProtoDescriptors(true);
                enhanceMetadata(genConfig, workDir, baseDir, setup, injector);
                GenTask metaJsonGenTask = injector.getInstance(MetaJsonGenTask.class);
                metaJsonGenTask.doGen(genConfig);
                break;
            case CodeOutputGenerator.PROTO:
                GenTask protoGenTask = injector.getInstance(ProtoGenTask.class);
                protoGenTask.doGen(genConfig);
                break;
            case CodeOutputGenerator.CSHARP:
                enhanceMetadata(genConfig, workDir, baseDir, setup, injector);
                GenTask cSharpGenTask = injector.getInstance(CsharpGenTask.class);
                cSharpGenTask.doGen(genConfig);
                break;
            case CodeOutputGenerator.PROTO_CSHARP:
                GenTask protoCSharpGenTask = injector.getInstance(CsharpProtoGenTask.class);
                protoCSharpGenTask.doGen(genConfig);
                break;
            default:
                throw new IllegalArgumentException("Unknown type " + type);
        }
    }

    private static void enhanceMetadata(PlexusGenConfig genConfig, URI workDir, URI baseDir, InteropLangStandaloneSetup setup, Injector injector) throws IOException, URISyntaxException {
        GenTask preProcessTask = injector.getInstance(CsharpProtoGenTask.class);
        File temp = FileUtils.createTempDir();
        String outDir = genConfig.getOutDir();
        genConfig.setOutDir(temp.getPath());
        preProcessTask.doGen(genConfig);
        genConfig.setBaseDir(temp.getPath());
        genConfig.setOutDir(outDir);
        setup.removeBaseURI(baseDir);
        baseDir = URI.createFileURI(genConfig.getBaseDir()).resolve(workDir).appendSegment("");
        setup.addBaseURI(baseDir);
    }

}
