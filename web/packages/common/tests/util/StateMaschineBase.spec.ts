/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { StateMaschineBase } from '../../src/util/state';

describe('StateMaschineBase', () => {

    enum State { CREATED, OPEN, CLOSED }

    it('Should switch states', (done) => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        expect(sut.canGo(State.CLOSED)).toBeTruthy();
        sut.goAsync(State.CLOSED).then(() => {
            expect(sut.is(State.CLOSED)).toBeTruthy();
            expect(sut.getCurrent()).toBe(State.CLOSED);
            done();
        });
    });

    it('Should execute preHandler before switching the state', (done) => {
        let called = false;
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, preHandler: async () => {
                    expect(sut.getCurrent()).toBe(State.OPEN);
                    called = true;
                }
            }
        ]);
        sut.goAsync(State.CLOSED).then(() => {
            expect(called).toBeTruthy();
            done();
        });
    });

    it('Should execute both static and dynamic preHandlers before switching the state', (done) => {
        let called = 0;
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, preHandler: async () => {
                    expect(sut.getCurrent()).toBe(State.OPEN);
                    called++;
                }
            }
        ]);
        sut.goAsync(State.CLOSED, {
            preHandler: async () => {
                expect(sut.getCurrent()).toBe(State.OPEN);
                called++;
            }
        }).then(() => {
            expect(called).toEqual(2);
            done();
        });
    });

    it('Should execute both static and dynamic post handlers after switching the state', (done) => {
        let called = 0;
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, postHandler: async () => {
                    expect(sut.getCurrent()).toBe(State.CLOSED);
                    called++;
                }
            }
        ]);
        sut.goAsync(State.CLOSED, {
            postHandler: async () => {
                expect(sut.getCurrent()).toBe(State.CLOSED);
                called++;
            }
        }).then(() => {
            expect(called).toEqual(2);
            done();
        });
    });

    it('Should execute postHandler after switching the state', (done) => {
        let called = false;
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, postHandler: async () => {
                    expect(sut.getCurrent()).toBe(State.CLOSED);
                    called = true;
                }
            }
        ]);
        sut.goAsync(State.CLOSED).then(() => {
            expect(called).toBeTruthy();
            done();
        });
    });

    it('Should raise error if current status is not correct', () => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        expect(() => sut.throwIfNot(State.CLOSED)).toThrow();
    });

    it('Should raise error if none of statuses is correct', () => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        expect(() => sut.throwIfNot(State.CLOSED, State.CREATED)).toThrow();
    });

    it('Should return true from one of check if second state is correct', (done) => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        expect(sut.canGo(State.CLOSED)).toBeTruthy();
        sut.goAsync(State.CLOSED).then(() => {
            expect(sut.is(State.CLOSED)).toBeTruthy();
            expect(sut.isOneOf(State.CREATED, State.CLOSED, State.OPEN)).toBeTruthy();
            done();
        });
    });

    it('Should return false from one of check if no correct states provided', (done) => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        expect(sut.canGo(State.CLOSED)).toBeTruthy();
        sut.goAsync(State.CLOSED).then(() => {
            expect(sut.isOneOf(State.CREATED, State.OPEN)).toBeFalsy();
            done();
        });
    });

    it('Should switch state synchronously', () => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED
            }
        ]);
        sut.go(State.CLOSED);
        expect(sut.getCurrent()).toEqual(State.CLOSED);
    });

    it('Should execute pre handler for synchronous switch', (done) => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, preHandler: async () => done()
            }
        ]);
        sut.go(State.CLOSED);
    });

    it('Should execute pre handler for synchronous switch', (done) => {
        const sut = new StateMaschineBase<State>(State.OPEN, [
            {
                from: State.OPEN, to: State.CLOSED, preHandler: async () => done()
            }
        ]);
        sut.go(State.CLOSED);
    });

});