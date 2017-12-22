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
export class RawMetadata {

    public static appsJson: string = `   
    {
        "apps": [
            {
            "id": "plexus.interop.testing.TestAppLauncher",
            "displayName": "Test App Launcher"
            },
            {
            "id": "plexus.interop.testing.EchoServer",
            "displayName": "Test Echo Server",
            "launcherId": "plexus.interop.testing.TestAppLauncher",
            "launcherParams": {}
            },
            {
            "id": "plexus.interop.testing.EchoClient",
            "displayName": "Test Echo Client",
            "launcherId": "plexus.interop.testing.TestAppLauncher",
            "launcherParams": {}
            }
        ]
    }
    `;

    public static interopJson: string = `   
    {
        "messages": [
            {
                "id": "plexus.interop.testing.EchoRequest",
                "fields": [
                    {
                        "name": "stringField",
                        "num": 1,
                        "primitive": true,
                        "type": "string"
                    }
                ]
            }
        ],
        "services": [
            {
                "id": "plexus.interop.testing.EchoService",
                "methods": [
                    {
                        "name": "Unary",
                        "input": "plexus.interop.testing.EchoRequest",
                        "output": "plexus.interop.testing.EchoRequest",
                        "type": "Unary"
                    },
                    {
                        "name": "ServerStreaming",
                        "input": "plexus.interop.testing.EchoRequest",
                        "output": "plexus.interop.testing.EchoRequest",
                        "type": "ServerStreaming"
                    },
                    {
                        "name": "ClientStreaming",
                        "input": "plexus.interop.testing.EchoRequest",
                        "output": "plexus.interop.testing.EchoRequest",
                        "type": "ClientStreaming"
                    },
                    {
                        "name": "DuplexStreaming",
                        "input": "plexus.interop.testing.EchoRequest",
                        "output": "plexus.interop.testing.EchoRequest",
                        "type": "DuplexStreaming"
                    }
                ]
            },
            {
                "id": "interop.AppLauncherService",
                "methods": [
                    {
                        "name": "Launch",
                        "input": "interop.AppLaunchRequest",
                        "output": "interop.AppLaunchResponse",
                        "type": "Unary"
                    }
                ]
            }
        ],
        "applications": [
            {
                "id": "plexus.interop.testing.EchoClient",
                "consumes": [
                    {
                        "service": "plexus.interop.testing.EchoService",
                        "from": [
                            "plexus.interop.testing.*"
                        ],
                        "methods": [
                            "Unary",
                            "ServerStreaming",
                            "ClientStreaming",
                            "DuplexStreaming"
                        ]
                    }
                ],
                "provides": [
                ]
            },
            {
                "id": "plexus.interop.testing.EchoServer",
                "consumes": [
                ],
                "provides": [
                    {
                        "service": "plexus.interop.testing.EchoService",
                        "title": "Sample Echo Service",
                        "to": [
                            "plexus.interop.testing.*"
                        ],
                        "methods": [
                            {
                                "name": "Unary",
                                "title": "Sample Unary Method"
                            },
                            {
                                "name": "ServerStreaming",
                                "title": "Sample Server Streaming Method"
                            },
                            {
                                "name": "ClientStreaming",
                                "title": "Sample Client Streaming Method"
                            },
                            {
                                "name": "DuplexStreaming",
                                "title": "Sample Duplex Streaming Method"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "plexus.interop.testing.TestAppLauncher",
                "consumes": [
                ],
                "provides": [
                    {
                        "service": "interop.AppLauncherService",
                        "title": "AppLauncherService",
                        "to": [
                            "interop.AppLifecycleManager"
                        ],
                        "methods": [
                            {
                                "name": "Launch",
                                "title": "Launch"
                            }
                        ]
                    }
                ]
            }
        ]
    }
    `;
}