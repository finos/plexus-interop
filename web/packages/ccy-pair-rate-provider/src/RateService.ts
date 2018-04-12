/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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

import * as plexus from './gen/plexus-messages';

export class RateService {
    
    public getRate(ccyPair: string): plexus.fx.ICcyPairRate {
         switch (ccyPair)  {
            case 'EURUSD':
                return {
                    ccyPairName: ccyPair,
                    rate: parseFloat((1.15 + 0.1 * Math.random()).toFixed(3))
                };
            case 'EURGBP':
                return {
                    ccyPairName: ccyPair,
                    rate: parseFloat((0.87 + 0.1 * Math.random()).toFixed(3))
                };
            default:
                throw new Error(`Unsupported CCY Pair name ${ccyPair}`);
        }
    }

}