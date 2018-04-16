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
export type Transitions<T> = Transition<T>[];

export interface Transition<T> {
    from: T;
    to: T;
    preHandler?: () => Promise<void>;
    postHandler?: () => Promise<void>;
}

export interface StateMaschine<T> {

    is(state: T): boolean;

    isOneOf(...states: T[]): boolean;

    canGo(state: T): boolean;

    getCurrent(): T;

    /**
     * Swithing the state asynchronously only if all pre-handlers resolved
     */
    goAsync(to: T, dynamicHandlers?: Handlers): Promise<void>;

    /**
     * Switching the state synchronously, executing pre and post handlers at background
     */
    go(to: T): void;

    throwIfNot(...states: T[]): void;
}

export type Handlers = {
    preHandler?: () => Promise<void>; 
    postHandler?: () => Promise<void>; 
};

