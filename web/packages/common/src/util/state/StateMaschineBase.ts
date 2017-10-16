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
import { Transition, Transitions, StateMaschine, Handlers } from "./StateMaschine";
import { Logger } from "../../../src/logger/Logger";

class StateDescriptor<T> {

    constructor(
        public state: T,
        public inTransitions: Transitions<T> = [],
        public outTransitions: Transitions<T> = []) { }

    public hasOutTransition(state: T): boolean {
        return this.outTransitions.filter(transtion => transtion.to === state).length > 0;
    }

    public hasInTransition(state: T): boolean {
        return this.inTransitions.filter(transtion => transtion.to === state).length > 0;
    }
}

export class StateMaschineBase<T> implements StateMaschine<T> {

    private readonly stateDescriptorsMap: Map<T, StateDescriptor<T>> = new Map<T, StateDescriptor<T>>();

    constructor(private current: T, private transitions: Transitions<T>, private logger?: Logger) {
        transitions.forEach(transition => {
            this.putIfAbsent(transition.from);
            this.putIfAbsent(transition.to);
            const fromDescriptor = this.lookup(transition.from);
            if (fromDescriptor.hasOutTransition(transition.to)) {
                throw `Transition ${transition.from} -> ${transition.to} already exists`;
            }
            fromDescriptor.outTransitions.push(transition);
        });
    }

    public is(state: T): boolean {
        return this.current === state;
    }

    public isOneOf(...states: T[]): boolean {
        for (const state of states) {
            if (this.is(state)) {
                return true;
            }
        }
        return false;
    }

    public getCurrent(): T {
        return this.current;
    }

    public canGo(state: T): boolean {
        const descriptor = this.stateDescriptorsMap.get(this.getCurrent());
        if (descriptor) {
            return descriptor.hasOutTransition(state);
        } else {
            return false;
        }
    }

    public goSync(to: T): void {
        if (!this.canGo(to)) {
            throw new Error(`Transition ${this.getCurrent()} -> ${to} does not exist`);
        }
        this.current = to;
    }

    public go(to: T, dynamicHandlers?: Handlers): Promise<void> {
        if (this.canGo(to)) {
            const descriptor = this.lookup(this.getCurrent());
            const transition = descriptor.outTransitions.find(transition => transition.to === to) as Transition<T>;
            return new Promise<void>((resolve, reject) => {

                const preHandlePassed = () => {
                    this.current = transition.to;

                    const postHandlerPromises = [dynamicHandlers ? dynamicHandlers.postHandler : null, transition.postHandler]
                        .filter(handler => !!handler)
                        .map(handler => handler as () => Promise<void>)
                        .map(handler => handler());

                    Promise.all(postHandlerPromises)
                        .then(() => resolve(), reject);

                };

                const preHandlePromises = [dynamicHandlers ? dynamicHandlers.preHandler : null, transition.preHandler]
                    .filter(handler => !!handler)
                    .map(handler => handler as () => Promise<void>)
                    .map(handler => handler());

                Promise.all(preHandlePromises)
                    .then(preHandlePassed.bind(this), reject);
            });
        } else {
            const error = `Transition ${this.getCurrent()} -> ${to} does not exist`;
            this.logError(error);
            return Promise.reject(error);
        }
    }

    public throwIfNot(...states: T[]): void {
        let result = false;
        for (const state of states) {
            if (this.is(state)) {
                result = true;
            }
        }
        if (!result) {
            const error = `Current state is ${this.current} not one of [${states.join(",")}]`;
            this.logError(error);
            throw new Error(error);
        }
    }

    private logError(m: string): void {
        if (this.logger) {
            this.logger.error(m);
        }
    }

    private putIfAbsent(state: T): void {
        if (!this.stateDescriptorsMap.has(state)) {
            this.stateDescriptorsMap.set(state, new StateDescriptor(state));
        }
    }

    private lookup(state: T): StateDescriptor<T> {
        return this.stateDescriptorsMap.get(state) as StateDescriptor<T>;
    }

}