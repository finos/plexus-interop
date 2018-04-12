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
﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Plexus
{
    public static class TypeExtensions
    {
        public static bool IsGenericType(this Type t)
        {
#if NET452
            return t.IsGenericType;
#else
            return t.GetTypeInfo().IsGenericType;
#endif
        }

        public static Type[] GetGenericArguments(this Type t)
        {
#if NET452
            return t.GetGenericArguments();
#else
            return t.GetTypeInfo().GenericTypeArguments;
#endif
        }

        public static string FormatName(this Type t)
        {
            if (!t.IsGenericType())
            {
                return t.FullName;
            }
            var sb = new StringBuilder();
            t.AppendGenericTypeName(sb, t.FullName);
            return sb.ToString();
        }

        private static void AppendGenericTypeName(this Type t, StringBuilder sb, string fullName)
        {
            if (!t.IsGenericType())
            {
                sb.Append(fullName);
                return;
            }
            var index = fullName.LastIndexOf("`");
            if (index == -1)
            {
                sb.Append(fullName);
            }
            else
            {
                sb.Append(fullName.Substring(0, index));
            }
            sb.Append("<");
            var genericTypes = t.GetGenericArguments();
            for (int i = 0; i < genericTypes.Length; i++)
            {
                if (i > 0)
                {
                    sb.Append(", ");
                }
                genericTypes[i].AppendGenericTypeName(sb, genericTypes[i].Name);
            }
            sb.Append(">");
        }
    }
}
