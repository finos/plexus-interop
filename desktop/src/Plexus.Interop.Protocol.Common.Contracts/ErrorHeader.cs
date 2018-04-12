/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
﻿using System.Collections.Generic;

namespace Plexus.Interop.Protocol.Common
{
    public struct ErrorHeader
    {
        public ErrorHeader(string message, string details)
        {
            Message = message;
            Details = details;
        }

        public string Message { get; }

        public string Details { get; }

        public override bool Equals(object obj)
        {
            if (!(obj is ErrorHeader))
            {
                return false;
            }

            var header = (ErrorHeader)obj;
            return Message == header.Message &&
                   Details == header.Details;
        }

        public override int GetHashCode()
        {
            var hashCode = 707783785;
            hashCode = hashCode * -1521134295 + base.GetHashCode();
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Message);
            hashCode = hashCode * -1521134295 + EqualityComparer<string>.Default.GetHashCode(Details);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{{nameof(Message)}: {Message}}}";
        }
    }
}
