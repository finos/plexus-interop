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
import { ConnectionStatus, Subscription } from './api/client-api';
import { LoggerFactory, Logger } from '@plexus-interop/common';

const logger: Logger = LoggerFactory.getLogger('PeerListener');

export class GenericListenerHolder<T> {
    
    private listeners: Array<(update: T) => void> = [];
    
    public addListener(callback: (update: T) => void): Subscription {
        this.listeners.push(callback);
        return {
            unsubscribe: async () => this.removeListener(callback)
        };
    }    

    public notifyListeners(update: T): void {
        this.listeners.forEach(l => {
            try {
                l(update);
            } catch (error) {
                logger.warn('Listener raised error', error);
            }
        });
    }

    public reset(): void {
        this.listeners.length = 0;
    
    }

    private removeListener(callback: (update: T) => void): void {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
}

export class ConnectionStatusListeners extends GenericListenerHolder<ConnectionStatus> {}
export class ErrorListeners extends GenericListenerHolder<Error> {}