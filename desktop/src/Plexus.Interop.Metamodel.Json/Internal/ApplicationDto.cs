/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
    using System.Collections.Generic;
    using System.Runtime.Serialization;

    [DataContract]
    internal sealed class ApplicationDto
    {
        private List<ProvidedServiceDto> _providedServices = new List<ProvidedServiceDto>();
        private List<ConsumedServiceDto> _consumedServices = new List<ConsumedServiceDto>();
        private List<OptionDto> _options = new List<OptionDto>();

        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "provides")]
        public List<ProvidedServiceDto> ProvidedServices
        {
            get => _providedServices = _providedServices ?? new List<ProvidedServiceDto>();
            set => _providedServices = value ?? new List<ProvidedServiceDto>();
        }

        [DataMember(Name = "consumes")]
        public List<ConsumedServiceDto> ConsumedServices
        {
            get => _consumedServices = _consumedServices ?? new List<ConsumedServiceDto>();
            set => _consumedServices = value ?? new List<ConsumedServiceDto>();
        }

        [DataMember(Name = "options")]
        public List<OptionDto> Options
        {
            get => _options = _options ?? new List<OptionDto>();
            set => _options = value ?? new List<OptionDto>();
        }
    }
}