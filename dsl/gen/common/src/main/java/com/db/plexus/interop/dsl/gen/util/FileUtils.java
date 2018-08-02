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
package com.db.plexus.interop.dsl.gen.util;

import org.apache.log4j.Logger;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.function.Consumer;

import static java.nio.file.FileVisitResult.CONTINUE;

public class FileUtils {

    private static Logger log = Logger.getLogger(FileUtils.class);

    public static File createTempDir() throws IOException {
        final Path directory = Files.createTempDirectory("plexus" + Long.toString(System.nanoTime()));
        return directory.toFile();
    }

    public static void writeStringToFile(final File file, final String content) throws IOException {
        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }
        FileWriter writer = new FileWriter(file);
        try {
            writer.append(content);
        } finally {
            writer.close();
        }
    }

    public static void processFiles(String baseDir, String pattern, Consumer<Path> fileHandler) throws IOException {
        Files.walkFileTree(Paths.get(baseDir), new Finder(pattern, fileHandler));
    }

    private static class Finder extends SimpleFileVisitor<Path> {

        private final PathMatcher matcher;
        private final Consumer<Path> fileHandler;

        Finder(String pattern, Consumer<Path> fileHandler) {
            matcher = new FilePathMatcher(pattern);
            this.fileHandler = fileHandler;
        }

        @Override
        public FileVisitResult visitFile(Path file,
                                         BasicFileAttributes attrs) {
            Path name = file.getFileName();
            if (matcher.matches(file) || (name != null && matcher.matches(name))) {
                fileHandler.accept(file);
            }
            return CONTINUE;
        }


        @Override
        public FileVisitResult visitFileFailed(Path file,
                                               IOException exc) {
            log.error(String.format("Failed to load %s file", file.toString()), exc);
            return CONTINUE;
        }
    }

}
