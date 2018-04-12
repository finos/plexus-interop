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
import * as Long from 'long';
import { util, configure } from 'protobufjs';
// make sure protobufjs uses Long implementation, to keep guids compatible with .Net broker
// https://github.com/dcodeIO/protobuf.js/issues/730
util.Long = Long;
configure();
export {plexus as transportProtocol} from './gen/internal-transport-protocol';
export {plexus as clientProtocol} from './gen/internal-client-protocol';
export * from './util/ClientProtocolHelper';
export * from './dto';;
