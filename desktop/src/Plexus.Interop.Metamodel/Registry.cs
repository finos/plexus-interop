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
﻿namespace Plexus.Interop.Metamodel
{
    using System;
    using System.Collections.Generic;

    public sealed class Registry : IRegistry, IRegistryProvider
    {
        public static readonly Registry Empty = new Registry();

        public Dictionary<string, IApplication> Applications { get; set; } = new Dictionary<string, IApplication>();

        public Dictionary<string, IService> Services { get; set; } = new Dictionary<string, IService>();

        public Dictionary<string, IMessage> Messages { get; set; } = new Dictionary<string, IMessage>();

        IReadOnlyDictionary<string, IApplication> IRegistry.Applications => Applications;

        IReadOnlyDictionary<string, IMessage> IRegistry.Messages => Messages;

        IReadOnlyDictionary<string, IService> IRegistry.Services => Services;

        public IRegistry Current => this;

        public event Action<IRegistry> Updated
        {
            add { value(this); }
            remove { }
        }

        public IRegistry MergeWith(IRegistry registry)
        {
            var newRegistry = new Registry();
            newRegistry.AddAll(registry);
            newRegistry.AddAll(this);
            return newRegistry;
        }

        private void AddAll(IRegistry registry)
        {
            foreach (var message in registry.Messages.Values)
            {
                Messages[message.Id] = message;
            }
            foreach (var service in registry.Services.Values)
            {
                Services[service.Id] = service;
            }
            foreach (var app in registry.Applications.Values)
            {
                Applications[app.Id] = app;
            }
        }
    }
}
