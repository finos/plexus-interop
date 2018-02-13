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
package com.db.plexus.interop.dsl.gen.csharp

import com.db.plexus.interop.dsl.gen.GenTask
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.proto.ProtoGenTask
import com.db.plexus.interop.dsl.gen.util.FileUtils
import com.google.inject.Inject
import java.io.File
import java.io.IOException
import java.util.LinkedList
import java.lang.ProcessBuilder.Redirect
import com.db.plexus.interop.dsl.gen.proto.ProtoOption

class CsharpGenTask2 implements GenTask {

	@Inject
	ProtoGenTask protoGenTask

	override doGen(PlexusGenConfig config) throws IOException {

		println("Generating C# code for " + config.input)

		val temp = File.createTempFile("proto", Long.toString(System.nanoTime()));
		temp.delete()
		temp.mkdir();

		try {
			val protoConfig = new PlexusGenConfig()
			protoConfig.baseDir = config.baseDir
			protoConfig.input = config.input
			protoConfig.outDir = temp.toString

			if (config.namespace !== null) {
				protoGenTask.customOptions.add(new ProtoOption("csharp_namespace", config.namespace))
			}

			protoGenTask.doGen(protoConfig)

			var out = config.outDir
			if (out.startsWith("internal_access:")) {
				out = out.substring("internal_access:".length)
			}
			val outPath = new File(out)
			outPath.delete
			outPath.mkdirs

			val args = new LinkedList<String>()
			args.add(config.protocPath)
			args.add("--csharp_out=" + config.outDir)
			args.add("--proto_path=" + protoConfig.outDir)
			FileUtils.processFiles(protoConfig.outDir, "*.proto", [ f |
				if(!f.endsWith("google/protobuf/descriptor.proto")) args.add(f.toString())
			])

			val procBuilder = new ProcessBuilder(args)
			procBuilder.inheritIO()
			println("Launching " + String.join(" ", procBuilder.command))
			var Process proc = null			
			try {
				proc = procBuilder.start()						
			}
			catch (Exception e) {
				throw new IOException("Cannot start Protobuf compiler: " + config.protocPath +
					". Probably the path is wrong. You can change it using command-line argument --protoc=<path>.", e)				
			}
			var exitCode = proc.waitFor;
			if (exitCode != 0) {
				throw new IOException("protoc process exited with non-zero exit code: " + exitCode)
			}
			println("C# code generated successfully to " + config.outDir)
		} finally {
			temp.delete()
		}
	}
}
