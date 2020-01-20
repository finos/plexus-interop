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
package com.db.plexus.interop.dsl.gen.util;

import org.junit.Test;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class CombinedFilePathMatcherTest {

    private static final Path INTEROP_CLIENT_PATH = Paths.get("client.interop");

    @Test
    public void testMatchesGlob() {
        assertTrue(new CombinedFilePathMatcher("**").matches(INTEROP_CLIENT_PATH));
    }

    @Test
    public void testWrongGlobNotMatches() {
        assertFalse(new CombinedFilePathMatcher("*.java").matches(INTEROP_CLIENT_PATH));
    }

    @Test
    public void testWrongPathNotMatches() {
        assertFalse(new CombinedFilePathMatcher("do/not/exist.interop").matches(INTEROP_CLIENT_PATH));
    }

}