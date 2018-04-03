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
namespace Plexus.Interop.Metamodel.Json.Internal
{
    using Newtonsoft.Json;
    using System.Collections.Generic;

    internal sealed class ConsumedServiceDto
    {
        [JsonProperty("service")]
        public string ServiceId{ get; set; }

        [JsonProperty("methods")]
        public List<ConsumedMethodDto> Methods { get; set; } = new List<ConsumedMethodDto>();

        [JsonProperty("alias")]
        public string Alias { get; set; }

        [JsonProperty("from")]
        public List<string> From { get; set; } = new List<string>();

        [JsonProperty("options")]
        public List<OptionDto> Options { get; set; } = new List<OptionDto>();
    }
}