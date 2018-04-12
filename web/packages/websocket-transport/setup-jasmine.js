/*
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
const reporters = require('jasmine-reporters');
const reporter = new reporters.JUnitXmlReporter({
    // Jest runs many instances of Jasmine in parallel. Force distinct file output
    // per test to avoid collisions.
    consolidateAll: false,
    filePrefix: 'jest-junit-result-',
    savePath: __dirname + '/target/surefire-reports/',
});
jasmine.getEnv().addReporter(reporter);
