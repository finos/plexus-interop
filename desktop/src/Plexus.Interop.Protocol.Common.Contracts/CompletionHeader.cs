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
﻿using System.Collections.Generic;

namespace Plexus.Interop.Protocol.Common
{
    public struct CompletionHeader
    {
        public static readonly CompletionHeader Completed = new CompletionHeader(CompletionStatusHeader.Completed, Maybe<ErrorHeader>.Nothing);
        public static readonly CompletionHeader Canceled = new CompletionHeader(CompletionStatusHeader.Canceled, Maybe<ErrorHeader>.Nothing);
        public static CompletionHeader Failed(ErrorHeader error) => new CompletionHeader(CompletionStatusHeader.Failed, error);

        public CompletionHeader(CompletionStatusHeader status, Maybe<ErrorHeader> error)
        {
            Status = status;
            Error = error;
        }

        public CompletionStatusHeader Status { get; }

        public Maybe<ErrorHeader> Error { get; }

        public override bool Equals(object obj)
        {
            if (!(obj is CompletionHeader))
            {
                return false;
            }

            var header = (CompletionHeader)obj;
            return Status == header.Status &&
                   Error.Equals(header.Error);
        }

        public override int GetHashCode()
        {
            var hashCode = -1826857896;
            hashCode = hashCode * -1521134295 + base.GetHashCode();
            hashCode = hashCode * -1521134295 + Status.GetHashCode();
            hashCode = hashCode * -1521134295 + EqualityComparer<Maybe<ErrorHeader>>.Default.GetHashCode(Error);
            return hashCode;
        }

        public override string ToString()
        {
            return $"{{{nameof(Status)}: {Status.ToString()}, {nameof(Error)}: {Error.ToString()}}}";
        }
    }
}
