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
import com.db.plexus.interop.dsl.protobuf.Enum
import com.db.plexus.interop.dsl.protobuf.Field
import com.db.plexus.interop.dsl.protobuf.PrimitiveFieldType
import com.db.plexus.interop.dsl.protobuf.ComplexFieldType
import org.eclipse.xtext.naming.IQualifiedNameProvider
import com.google.inject.Inject
import org.eclipse.xtext.naming.QualifiedName
import com.db.plexus.interop.dsl.protobuf.Constant
import com.db.plexus.interop.dsl.protobuf.StringConstant
import com.db.plexus.interop.dsl.protobuf.IntConstant
import com.db.plexus.interop.dsl.protobuf.EnumConstant
import com.db.plexus.interop.dsl.protobuf.BoolConstant
import com.db.plexus.interop.dsl.protobuf.DecimalConstant
import com.db.plexus.interop.dsl.InteropLangUtils
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils
import java.util.Map

public class GenUtils {

    public static final String INTEROP_OPTIONS_RESOURCE_PATH = "interop/options.proto"
    public static final String INTEROP_DESCRIPTOR_RESOURCE_PATH = InteropLangUtils.DESCRIPTOR_RESOURCE_PATH
    public static final String PROTOBUF_DESCRIPTOR_RESOURCE_PATH = ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH

    public static final QualifiedName ROOT_PACKAGE_NAME = QualifiedName.create("")
    public static final QualifiedName INTEROP_PACKAGE_NAME = ROOT_PACKAGE_NAME.append("interop")
    public static final QualifiedName INTEROP_SERVICE_ID_OPTION_NAME = INTEROP_PACKAGE_NAME.append("service_id")
    public static final QualifiedName INTEROP_MESSAGE_ID_OPTION_NAME = INTEROP_PACKAGE_NAME.append("message_id")

    public static final QualifiedName INTEROP_PROVIDED_SERVICE_TITLE_OPTION_NAME = INTEROP_PACKAGE_NAME.append(QualifiedName.create("ProvidedServiceOptions", "title"))
    public static final QualifiedName INTEROP_PROVIDED_METHOD_TITLE_OPTION_NAME = INTEROP_PACKAGE_NAME.append(QualifiedName.create("ProvidedMethodOptions", "title"))

    @Inject
    IQualifiedNameProvider qualifiedNameProvider

    def static getOptionList(EObject obj) {
        return obj.eContents.filter(typeof(Option)).toList()
    }

    def static getValueAsString(Option option) {
        val constant = option.value
        return switch (constant) {
            IntConstant: return constant.value.toString
            EnumConstant: return constant.value.name
            StringConstant: return constant.value
            BoolConstant: return constant.value.toString
            DecimalConstant: return constant.value.toString
        }
    }

    def static List<Service> getServices(Resource... resources) {
        return Arrays.stream(resources)
        .flatMap([resource | getServices(resource).stream()])
        .collect(Collectors.toList());
    }

    def getServicesMap(Resource... resources) {
        return getServices(resources)
        .stream()
        .collect(Collectors.toMap(
                        [getFullName],
                        [it],
                        [value, duplicate | value]
                ));
    }

    def getServiceMethodsMap(Resource... resources) {
        return getServices(resources)
        .stream()
        .flatMap[s | s.getMethods().stream().map[m | {
                    val methodId = s.getFullName() + "." + m.name;
                    return methodId -> m;
                }]]
        .collect(Collectors.toMap([key], [value], [value, duplicate | value]));
    }

    def static List<Message> getMessages(Resource... resources) {
        return Arrays.stream(resources)
        .flatMap([resource | getMessages(resource).stream()])
        .collect(Collectors.toList());
    }

    def Map<String, Message> getMessagesMap(Resource... resources) {
        return getMessages(resources)
        .stream()
        .collect(Collectors.toMap([getFullName], [it], [f, s | f]));
    }

    def Map<String, Field> getFieldsMap(Resource... resources) {
        return getMessages(resources)
        .stream()
        .flatMap([m | getFields(m).stream().map[f | f -> m]])
        .collect(Collectors.toMap(
                        [pair | pair.value.getFullName + "." + pair.key.name],
                        [key],
                        [value, duplicate | value]));
    }

    def String getType(Field field) {
        val typeRef = field.getTypeReference();
        switch typeRef {
            PrimitiveFieldType: typeRef.getValue().literal.toLowerCase()
            ComplexFieldType: getType(typeRef)
            default: "Unsupported"
        }
    }

    def static String getAliasOrName(ProvidedService providedService) {
        return if(providedService.alias !== null) providedService.alias else providedService.service.name
    }

    def static String getAliasOrName(ConsumedService service) {
        return if(service.alias !== null) service.alias else service.service.name
    }

    def static boolean isPrimitive(Field field) {
        val typeRef = field.getTypeReference();
        switch typeRef {
            PrimitiveFieldType: true
            default: false
        }
    }

    def getQualifiedName(EObject obj) {
        return qualifiedNameProvider.getFullyQualifiedName(obj)
    }

    def getFullName(EObject obj) {
        return getQualifiedName(obj).skipFirst(1).toString()
    }

    def String getType(ComplexFieldType complexFieldType) {
        val complexType = complexFieldType.getValue()
        switch complexType {
            Message: getFullName(complexType)
            Enum: getFullName(complexType)
            default: "Unsupported"
        }
    }

    def static List<Field> getFields(Message message) {
        return message
        .elements
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
        return service.elements.filter(typeof(Method)).toList()
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

    def getApplicationsMap(Resource... resources) {
        return getApplications(resources)
        .stream()
        .collect(Collectors.toMap(
                        [getFullName],
                        [it],
                        [value, duplicate | value]
                ));
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
        return service.elements.filter(typeof(ConsumedMethod)).toList()
    }

    def static List<ProvidedMethod> getMethods(ProvidedService service) {
        return service.elements.filter(typeof(ProvidedMethod)).toList()
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

    def String getTitle(ProvidedService providedService) {
        val titleOption = providedService.elements
        .filter(typeof(Option))
        .findFirst[o | getQualifiedName(o.descriptor).equals(INTEROP_PROVIDED_SERVICE_TITLE_OPTION_NAME)];
        if(titleOption === null) {
            return providedService.service.name
        }
        return titleOption.value.asString
    }

    def String getTitle(ProvidedMethod providedMethod) {
        if(providedMethod.options === null) {
            return providedMethod.method.name
        }
        val titleOption = providedMethod.options
        .findFirst[o | getQualifiedName(o.descriptor).equals(INTEROP_PROVIDED_METHOD_TITLE_OPTION_NAME)];
        if(titleOption === null) {
            return providedMethod.method.name
        }
        return titleOption.value.asString
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

    def static String getAsString(Constant constant) {
        if(constant instanceof StringConstant) {
            return constant.value
        }
    }
}