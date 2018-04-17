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
        "messages": {
          "nested": {
            "plexus": {
              "nested": {
                "interop": {
                  "nested": {
                    "testing": {
                      "options": {
                        "csharp_namespace": "plexus"
                      },
                      "nested": {
                        "EchoService": {
                          "options": {
                            "(.interop.service_id)": "plexus.interop.testing.EchoService"
                          },
                          "methods": {
                            "Unary": {
                              "requestType": "EchoRequest",
                              "responseType": "EchoRequest"
                            },
                            "ServerStreaming": {
                              "requestType": "EchoRequest",
                              "responseType": "EchoRequest",
                              "responseStream": true
                            },
                            "ClientStreaming": {
                              "requestType": "EchoRequest",
                              "requestStream": true,
                              "responseType": "EchoRequest"
                            },
                            "DuplexStreaming": {
                              "requestType": "EchoRequest",
                              "requestStream": true,
                              "responseType": "EchoRequest",
                              "responseStream": true
                            }
                          }
                        },
                        "EchoRequest": {
                          "options": {
                            "(.interop.message_id)": "plexus.interop.testing.EchoRequest"
                          },
                          "fields": {
                            "stringField": {
                              "type": "string",
                              "id": 1
                            },
                            "int64Field": {
                              "type": "int64",
                              "id": 2
                            },
                            "uint32Field": {
                              "type": "uint32",
                              "id": 3
                            },
                            "repeatedDoubleField": {
                              "rule": "repeated",
                              "type": "double",
                              "id": 4
                            },
                            "enumField": {
                              "type": "SubEnum",
                              "id": 5
                            },
                            "subMessageField": {
                              "type": "SubMessage",
                              "id": 6
                            },
                            "repeatedSubMessageField": {
                              "rule": "repeated",
                              "type": "SubMessage",
                              "id": 7
                            }
                          },
                          "nested": {
                            "SubMessage": {
                              "options": {
                                "(.interop.message_id)": "plexus.interop.testing.EchoRequest.SubMessage"
                              },
                              "fields": {
                                "bytesField": {
                                  "type": "bytes",
                                  "id": 1
                                },
                                "stringField": {
                                  "type": "string",
                                  "id": 2
                                }
                              }
                            },
                            "SubEnum": {
                              "values": {
                                "value_one": 0,
                                "value_two": 1
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "interop": {
              "options": {
                "csharp_namespace": "plexus"
              },
              "nested": {
                "messageId": {
                  "type": "string",
                  "id": 9650,
                  "extend": "google.protobuf.MessageOptions"
                },
                "serviceId": {
                  "type": "string",
                  "id": 9650,
                  "extend": "google.protobuf.ServiceOptions"
                },
                "methodId": {
                  "type": "string",
                  "id": 9650,
                  "extend": "google.protobuf.MethodOptions"
                },
                "ApplicationOptions": {
                  "fields": {
                    "title": {
                      "type": "string",
                      "id": 1
                    },
                    "launchOnCall": {
                      "type": "ApplicationLaunchOnCallMode",
                      "id": 2
                    }
                  }
                },
                "ProvidedServiceOptions": {
                  "fields": {
                    "title": {
                      "type": "string",
                      "id": 1
                    },
                    "launchOnCall": {
                      "type": "ApplicationLaunchOnCallMode",
                      "id": 2
                    }
                  }
                },
                "ConsumedServiceOptions": {
                  "fields": {}
                },
                "ProvidedMethodOptions": {
                  "fields": {
                    "title": {
                      "type": "string",
                      "id": 1
                    },
                    "launchOnCall": {
                      "type": "ApplicationLaunchOnCallMode",
                      "id": 2
                    },
                    "timeoutMs": {
                      "type": "uint32",
                      "id": 3
                    }
                  }
                },
                "ConsumedMethodOptions": {
                  "fields": {}
                },
                "ApplicationLaunchOnCallMode": {
                  "options": {
                    "allow_alias": true
                  },
                  "values": {
                    "IF_NOT_LAUNCHED": 0,
                    "DEFAULT": 0,
                    "ALWAYS": 1,
                    "ENABLED": 1,
                    "NEVER": 2,
                    "DISABLED": 2
                  }
                },
                "AppLauncherService": {
                  "options": {
                    "(.interop.service_id)": "interop.AppLauncherService"
                  },
                  "methods": {
                    "Launch": {
                      "requestType": "AppLaunchRequest",
                      "responseType": "AppLaunchResponse"
                    }
                  }
                },
                "AppLaunchRequest": {
                  "options": {
                    "(.interop.message_id)": "interop.AppLaunchRequest"
                  },
                  "fields": {
                    "appId": {
                      "type": "string",
                      "id": 1
                    },
                    "launchParamsJson": {
                      "type": "string",
                      "id": 2
                    },
                    "launchMode": {
                      "type": "AppLaunchMode",
                      "id": 3
                    },
                    "suggestedAppInstanceId": {
                      "type": "UniqueId",
                      "id": 4
                    }
                  }
                },
                "AppLaunchResponse": {
                  "options": {
                    "(.interop.message_id)": "interop.AppLaunchResponse"
                  },
                  "fields": {
                    "appInstanceId": {
                      "type": "UniqueId",
                      "id": 1
                    }
                  }
                },
                "UniqueId": {
                  "options": {
                    "(.interop.message_id)": "interop.UniqueId"
                  },
                  "fields": {
                    "lo": {
                      "type": "fixed64",
                      "id": 1
                    },
                    "hi": {
                      "type": "fixed64",
                      "id": 2
                    }
                  }
                },
                "AppLaunchMode": {
                  "values": {
                    "SINGLE_INSTANCE": 0,
                    "MULTI_INSTANCE": 1
                  }
                }
              }
            }
          }
        }
        ,
        "services": [
          {
            "id": "plexus.interop.testing.EchoService",
            "methods": [
              {
                "name": "Unary",
                "request": "plexus.interop.testing.EchoRequest",
                "response": "plexus.interop.testing.EchoRequest",
                "type": "Unary"
              },
              {
                "name": "ServerStreaming",
                "request": "plexus.interop.testing.EchoRequest",
                "response": "plexus.interop.testing.EchoRequest",
                "type": "ServerStreaming"
              },
              {
                "name": "ClientStreaming",
                "request": "plexus.interop.testing.EchoRequest",
                "response": "plexus.interop.testing.EchoRequest",
                "type": "ClientStreaming"
              },
              {
                "name": "DuplexStreaming",
                "request": "plexus.interop.testing.EchoRequest",
                "response": "plexus.interop.testing.EchoRequest",
                "type": "DuplexStreaming"
              }
            ],
            "options": [
              {
                "id": "interop.service_id",
                "value": "plexus.interop.testing.EchoService"
              }
            ]
          },
          {
            "id": "interop.AppLauncherService",
            "methods": [
              {
                "name": "Launch",
                "request": "interop.AppLaunchRequest",
                "response": "interop.AppLaunchResponse",
                "type": "Unary"
              }
            ],
            "options": [
              {
                "id": "interop.service_id",
                "value": "interop.AppLauncherService"
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
                "methods": [
                  {
                    "name": "Unary"
                  },
                  {
                    "name": "ServerStreaming"
                  },
                  {
                    "name": "ClientStreaming"
                  },
                  {
                    "name": "DuplexStreaming"
                  }
                ],
                "from": [
                  "plexus.interop.testing.*"
                ]
              },
              {
                "service": "plexus.interop.testing.EchoService",
                "methods": [
                  {
                    "name": "Unary"
                  }
                ],
                "alias": "ServiceAlias",
                "from": [
                  "plexus.interop.testing.*"
                ]
              }
            ]
          },
          {
            "id": "plexus.interop.testing.EchoServer",
            "provides": [
              {
                "service": "plexus.interop.testing.EchoService",
                "methods": [
                  {
                    "name": "Unary",
                    "options": [
                      {
                        "id": "interop.ProvidedMethodOptions.title",
                        "value": "Sample Unary Method"
                      }
                    ]
                  },
                  {
                    "name": "ServerStreaming",
                    "options": [
                      {
                        "id": "interop.ProvidedMethodOptions.title",
                        "value": "Sample Server Streaming Method"
                      }
                    ]
                  },
                  {
                    "name": "ClientStreaming",
                    "options": [
                      {
                        "id": "interop.ProvidedMethodOptions.title",
                        "value": "Sample Client Streaming Method"
                      }
                    ]
                  },
                  {
                    "name": "DuplexStreaming",
                    "options": [
                      {
                        "id": "interop.ProvidedMethodOptions.title",
                        "value": "Sample Duplex Streaming Method"
                      }
                    ]
                  }
                ],
                "to": [
                  "plexus.interop.testing.*"
                ],
                "options": [
                  {
                    "id": "interop.ProvidedServiceOptions.title",
                    "value": "Sample Echo Service"
                  }
                ]
              },
              {
                "service": "plexus.interop.testing.EchoService",
                "methods": [
                  {
                    "name": "Unary",
                    "options": [
                      {
                        "id": "interop.ProvidedMethodOptions.title",
                        "value": "Sample Unary Method with Alias"
                      }
                    ]
                  }
                ],
                "alias": "ServiceAlias",
                "to": [
                  "plexus.interop.testing.*"
                ],
                "options": [
                  {
                    "id": "interop.ProvidedServiceOptions.title",
                    "value": "Sample Echo Service with Alias"
                  }
                ]
              }
            ]
          },
          {
            "id": "plexus.interop.testing.TestAppLauncher",
            "provides": [
              {
                "service": "interop.AppLauncherService",
                "methods": [
                  {
                    "name": "Launch"
                  }
                ],
                "to": [
                  "interop.AppLifecycleManager"
                ]
              }
            ]
          }
        ]
    }    
    `;
}