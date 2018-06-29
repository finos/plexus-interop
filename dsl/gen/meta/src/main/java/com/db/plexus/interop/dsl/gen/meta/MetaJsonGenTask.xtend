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
package com.db.plexus.interop.dsl.gen.meta

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import java.io.IOException
import com.google.inject.Inject
import com.db.plexus.interop.dsl.gen.util.FileUtils
import java.io.File
import java.util.ArrayList
import java.util.Arrays
import com.db.plexus.interop.dsl.gen.BaseGenTask
import org.eclipse.xtext.resource.XtextResourceSet
import static com.db.plexus.interop.dsl.gen.util.ProcessUtils.*

class MetaJsonGenTask extends BaseGenTask {

    @Inject
    MetaJsonGenerator generator

    override doGenWithResources(PlexusGenConfig config, XtextResourceSet rs) throws IOException {
        val resources = rs.getResources()
        val protoFilePaths = getProtoFilePaths(resources, config)
        var messagesJson = "[]";
        if(!protoFilePaths.isEmpty() && config.getProtocPath() !== null) {
            val pbJsArgs = new ArrayList(Arrays.asList(config.getProtocPath()));
            pbJsArgs.addAll(this.protoArgs())
            pbJsArgs.addAll(protoFilePaths);
            this.logger.info(String.format("Running compiler with args [%s]", String.join(" ", pbJsArgs)));
            val result = execSync(pbJsArgs);
            if(result.code !=  0) {
                this.logger.warning("Compiler has returned non-zero result code " + result.code);
            } else {
                messagesJson = result.stdout;
            }
        }
        config.setMessagesMetadata(messagesJson);
        val str = generator.generate(config, rs)
        FileUtils.writeStringToFile(new File(config.outDir + "/interop.json"), str)
    }

    override inputFilesGlob(PlexusGenConfig config) {
        "*.interop"
    }

    def protoArgs() {
        return Arrays.asList("-t", "json");
    }

}