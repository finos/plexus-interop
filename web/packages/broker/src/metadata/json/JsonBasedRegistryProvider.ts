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
import { RegistryProvider } from "../RegistryProvider";
import { Registry } from "../model/Registry";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/scan";
import { RegistryDto } from "./RegistryDto";
import { ExtendedArray, Logger, LoggerFactory, ExtendedMap } from "@plexus-interop/common";
import { Message } from "../model/Message";
import { ServiceDto } from "./ServiceDto";
import { Service } from "../model/Service";
import { Method } from "../model/Method";
import { MethodType } from "../model/MethodType";
import { MethodTypeDto } from "./MethodTypeDto";
import { toMap } from "../../../../common/src/util/Arrays";
import { Application } from "../model/Application";
import { ConsumedServiceDto } from "./ConsumedServiceDto";
import { ConsumedService } from "../model/ConsumedService";
import { MatchPatternFactory } from "../model/MatchPatternFactory";
import { ConsumedMethod } from "../model/ConsumedMethod";
import { MethodReferenceDto } from "./MethodReferenceDto";

export class JsonBasedRegistryProvider implements RegistryProvider {

    private log: Logger = LoggerFactory.getLogger("JsonBasedRegistryProvider");

    private readonly $registry: Observable<Registry>;
    private current: Registry;

    public constructor(jsonMetadata: string, $jsonMetadata?: Observable<string>) {
        this.current = this.parseRegistry(jsonMetadata);
        this.$registry = ($jsonMetadata || Observable.of(jsonMetadata))
            .map(this.parseRegistry)
            .scan(r => this.current = r);
    }

    private parseRegistry(jsonRegistry: string): Registry {

        this.log.trace(`Parsing JSON registry of ${jsonRegistry.length} length`);
        const registryDto: RegistryDto = JSON.parse(jsonRegistry);
        this.log.trace(`Finished parsing ${jsonRegistry.length} length`);

        const messages: ExtendedMap<string, Message> = ExtendedArray.of(registryDto.services)
            .flatMap(s => ExtendedArray.of(s.methods)
                .flatMap(m => [m.input, m.output])
                .toArray())
            .distinct()
            .toMap(x => x, x => { return { id: x }; });

        const services = ExtendedArray.of(
            registryDto.services.map(s => this.convertService(messages, s)))
            .toMap(s => s.id, s => s);

        const applications = new ExtendedMap<string, Application>();

        return {
            messages,
            services,
            applications
        };
    }

    private convertConsumedService(serviceDto: ConsumedServiceDto, application: Application, service: Service) {
        const methods = new ExtendedMap<string, ConsumedMethod>();
        const consumedService: ConsumedService = {
            service,
            application,
            from: MatchPatternFactory.createMatcher(serviceDto.from),
            methods
        };
        serviceDto.methods
            .map(m => {
                return {
                    method: service.methods.get(this.getName(m)) as Method,
                    consumedService
                } as ConsumedMethod;
            })
            .forEach(cm => methods.set(cm.method.name, cm));
        return consumedService;
    }

    private getName(methodRef: MethodReferenceDto): string {
        return (methodRef as { name: string }).name || methodRef as string;
    }

    private convertService(messagesMap: Map<string, Message>, serviceDto: ServiceDto): Service {
        const service: Service = {
            id: serviceDto.id,
            methods: new ExtendedMap<string, Method>()
        };
        service.methods = toMap(
            serviceDto.methods.map(methodDto => {
                return {
                    name: methodDto.name,
                    type: this.convertMethodType(methodDto.type),
                    inputMessage: messagesMap.get(methodDto.input) as Message,
                    outputMessage: messagesMap.get(methodDto.output) as Message,
                    service
                } as Method;
            }), m => m.name, m => m);
        return service;
    }

    private convertMethodType(methoTypeDto: MethodTypeDto): MethodType {
        switch (methoTypeDto) {
            case MethodTypeDto.ClientStreaming:
                return MethodType.ClientStreaming;
            case MethodTypeDto.ServerStreaming:
                return MethodType.ServerStreaming;
            case MethodTypeDto.Unary:
                return MethodType.Unary;
            case MethodTypeDto.DuplexStreaming:
                return MethodType.DuplexStreaming;
            default:
                throw new Error("Unsupported method type: " + methoTypeDto);
        }
    }

    public getCurrent(): Registry {
        return this.current;
    }

    public getRegistry(): Observable<Registry> {
        return this.$registry;
    }

}