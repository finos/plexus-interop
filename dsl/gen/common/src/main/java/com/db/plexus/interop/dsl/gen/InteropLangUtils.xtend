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
package com.db.plexus.interop.dsl.gen

import java.util.List
import com.db.plexus.interop.dsl.protobuf.Service
import org.eclipse.emf.ecore.resource.Resource
import java.util.Arrays
import java.util.stream.Collectors
import com.db.plexus.interop.dsl.protobuf.Method
import com.db.plexus.interop.dsl.Application
import com.db.plexus.interop.dsl.ConsumedService
import com.db.plexus.interop.dsl.ProvidedService
import com.db.plexus.interop.dsl.ConsumedMethod
import com.db.plexus.interop.dsl.ProvidedMethod
import java.util.LinkedList
import com.db.plexus.interop.dsl.protobuf.Option
import org.eclipse.emf.ecore.EObject
import com.db.plexus.interop.dsl.protobuf.Message
import com.db.plexus.interop.dsl.protobuf.Field
import com.db.plexus.interop.dsl.protobuf.PrimitiveFieldType

public class InteropLangUtils {

    def static List<Service> getServices(Resource... resources) {
        return Arrays.stream(resources)
        .flatMap([resource | getServices(resource).stream()])
        .collect(Collectors.toList());
    }

    def static List<Message> getMessages(Resource... resources) {
        return Arrays.stream(resources)
        .flatMap([resource | getMessages(resource).stream()])
        .collect(Collectors.toList());
    }

    def static String getType(Field field) {
        val typeRef = field.getTypeReference();
        if (typeRef instanceof PrimitiveFieldType) {
            return (typeRef as PrimitiveFieldType).getValue().literal.toLowerCase();
        } else {
            return "Unsupported";
        }
    }

    def static List<Field> getFields(Message message) {
        return message.getBody()
        .getElements()
        .stream()
        .filter([el | el instanceof Field])
        .map([el | el as Field])
        .collect(Collectors.toList());
    }

    def static List<Message> getMessages(Resource resource) {
        return resource.allContents
        .filter(typeof(Message))
        .toList();
    }

    def static List<Service> getServices(Resource resource) {
        return resource.allContents
        .filter(typeof(Service))
        .toList();
    }

    def static List<Method> getMethods(Service service) {
        return service.body.elements.filter(typeof(Method)).toList()
    }

    def static Service getService(Method method) {
        var obj = method as EObject
        while(obj !== null) {
            val parent = obj.eContainer
            val service = tryGetService(parent)
            if(service !== null) {
                return service
            }
            obj = obj.eContainer;
        }
        return null;
    }

    def private static Service tryGetService(EObject object) {
        switch object {
            ConsumedService: object.service
            ProvidedService: object.service
            Service: object
            default: null
        }
    }

    def static List<Application> getApplications(Resource... resources) {
        return Arrays.stream(resources)
        .flatMap([resource | getApplications(resource).stream()])
        .collect(Collectors.toList());
    }

    def static List<Application> getApplications(Resource resource) {
        return resource.allContents
        .filter(typeof(Application))
        .toList();
    }

    def static isPointToPoint(Method rpc) {
        return !rpc.getRequest().getIsStream() && !rpc.getResponse().getIsStream();
    }

    def static isBidiStreaming(Method rpc) {
        return rpc.getRequest().getIsStream() && rpc.getResponse().getIsStream();
    }

    def static isClientStreaming(Method rpc) {
        return rpc.getRequest().getIsStream() && !rpc.getResponse().getIsStream();
    }

    def static isServerStreaming(Method rpc) {
        return !rpc.getRequest().getIsStream() && rpc.getResponse().getIsStream();
    }

    def static List<ConsumedService> getConsumedServices(Application application) {
        return application.elements.filter(typeof(ConsumedService)).toList()
    }

    def static List<ProvidedService> getProvidedServices(Application application) {
        return application.elements.filter(typeof(ProvidedService)).toList()
    }

    def static List<ConsumedMethod> getMethods(ConsumedService service) {
        return service.body.elements.filter(typeof(ConsumedMethod)).toList()
    }

    def static List<ProvidedMethod> getMethods(ProvidedService service) {
        return service.body.elements.filter(typeof(ProvidedMethod)).toList()
    }

    def static List<String> getWildcards(ConsumedService service) {
        if(service.restrictions === null) {
            return new LinkedList<String>()
        }
        return service.restrictions.elements.map[x | x.wildcard]
    }

    def static List<String> getWildcards(ProvidedService service) {
        if(service.restrictions === null) {
            return new LinkedList<String>()
        }
        return service.restrictions.elements.map[x | x.wildcard]
    }

    def static String getTitle(ProvidedService providedService) {
        val titleOption = providedService.body.elements.filter(typeof(Option)).findFirst[o | o.name.equals("service_title") || o.name.equals("(.interop.service_title)")];
        if(titleOption === null) {
            return providedService.service.name
        }
        return titleOption.value.replaceAll("^\"", "").replaceAll("\"$", "")
    }

    def static String getTitle(ProvidedMethod providedMethod) {
        if(providedMethod.options === null) {
            return providedMethod.method.name
        }
        val titleOption = providedMethod.options.elements.findFirst[o | o.name.equals("method_title") || o.name.equals("(.interop.method_title")];
        if(titleOption === null) {
            return providedMethod.method.name
        }
        return titleOption.value.replaceAll("^\"", "").replaceAll("\"$", "")
    }

    def static String getType(Method method) {
        if(isBidiStreaming(method)) {
            return "DuplexStreaming"
        }
        if(isServerStreaming(method)) {
            return "ServerStreaming"
        }
        if(isClientStreaming(method)) {
            return "ClientStreaming"
        }
        return "Unary"
    }
}