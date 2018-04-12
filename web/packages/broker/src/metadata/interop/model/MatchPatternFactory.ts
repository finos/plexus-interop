/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { MatchPattern } from './MatchPattern';

export class MatchPatternFactory {

    private static all: MatchPattern = {
        isMatch: () => true
    };

    public static createMatcher(patterns: string[]): MatchPattern {
        return patterns && patterns.length > 0 ?
            new MultipleMatchersHolder(patterns.map(p => MatchPatternFactory.createSingleMatcher(p)))
            : MatchPatternFactory.all;
    }

    private static createSingleMatcher(pattern: string): MatchPattern {
        if (pattern === '*') {
            return MatchPatternFactory.all;
        }
        if (pattern.endsWith('*')) {
            return new StartsWithMatcher(pattern.substr(0, pattern.length - 1));
        }
        return new ExactMatcher(pattern);
    }

}

class MultipleMatchersHolder implements MatchPattern {

    constructor(private matchers: MatchPattern[]) { }

    public isMatch(s: string): boolean {
        return !!this.matchers.find(m => m.isMatch(s));
    }

}

class StartsWithMatcher implements MatchPattern {

    constructor(private readonly base: string) { }

    public isMatch(s: string): boolean {
        return s.startsWith(this.base);
    }

}

class ExactMatcher implements MatchPattern {

    constructor(private readonly base: string) { }

    public isMatch(s: string): boolean {
        return s === this.base;
    }

}

