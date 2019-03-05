/**
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
namespace Plexus.Interop.Metamodel.Json.Internal
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.Serialization;    

    [DataContract]
    internal sealed class MethodDto
    {
        private List<OptionDto> _options = new List<OptionDto>();

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "title")]
        public string Title { get; set; }

        [DataMember(Name = "request")]
        public string RequestMessageId { get; set; }

        [DataMember(Name = "response")]
        public string ResponseMessageId { get; set; }

        public MethodTypeDto Type { get; set; }

        [DataMember(Name = "type")]
        internal string TypeInternal
        {
            get => Enum.GetName(typeof(MethodTypeDto), Type);
            set => Type = (MethodTypeDto)Enum.Parse(typeof(MethodTypeDto), value);
        }

        [DataMember(Name = "options")]
        public List<OptionDto> Options
        {
            get => _options = _options ?? new List<OptionDto>();
            set => _options = value ?? new List<OptionDto>();
        }
    }
}