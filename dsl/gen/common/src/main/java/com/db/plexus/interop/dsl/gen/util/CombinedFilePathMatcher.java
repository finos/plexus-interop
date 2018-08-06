/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.db.plexus.interop.dsl.gen.util;

import java.nio.file.*;

public class CombinedFilePathMatcher implements PathMatcher {

    private final PathMatcher globMatcher;
    private final PathMatcher simplePathMatcher;

    public CombinedFilePathMatcher(String pattern) {
        this.globMatcher = FileSystems.getDefault()
                .getPathMatcher("glob:" + pattern);
        this.simplePathMatcher = new SimplePathMatcher(pattern);
    }

    @Override
    public boolean matches(Path path) {
        return this.simplePathMatcher.matches(path) || this.globMatcher.matches(path);
    }
}
