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

namespace Plexus
{
    public struct Maybe<T> : IEquatable<Maybe<T>>
    {
        public static readonly Maybe<T> Nothing = new Maybe<T>();

        private readonly T _value;

        public Maybe(T value)
        {
            HasValue = true;
            _value = value;
        }

        public bool HasValue { get; }

        public T Value
        {
            get
            {
                if (!HasValue)
                {
                    throw new InvalidOperationException("Value not set");
                }
                return _value;
            }
        }

        public static implicit operator Maybe<T>(T value)
        {
            return new Maybe<T>(value);
        }

        public static implicit operator Maybe<T>(Nothing value)
        {
            return Nothing;
        }

        public T GetValueOrDefault()
        {
            return HasValue ? Value : default;
        }

        public T GetValueOrDefault(T defaultValue)
        {
            return HasValue ? Value : defaultValue;
        }

        public T GetValueOrThrowException<TException>(TException exception) where TException : Exception
        {
            if (!HasValue)
            {
                throw exception;
            }
            return Value;
        }

        public T GetValueOrThrowException<TException>() where TException : Exception, new()
        {
            if (!HasValue)
            {
                throw new TException();
            }
            return Value;
        }

        public override string ToString()
        {
            return HasValue ? Value?.ToString() : Plexus.Nothing.Instance.ToString();
        }

        public override bool Equals(object obj)
        {
            return obj is Maybe<T> maybe && Equals(maybe);
        }

        public bool Equals(Maybe<T> other)
        {
            return EqualityComparer<T>.Default.Equals(_value, other._value) &&
                   HasValue == other.HasValue;
        }
        
        public static bool operator ==(Maybe<T> left, Maybe<T> right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(Maybe<T> left, Maybe<T> right)
        {
            return !left.Equals(right);
        }

        public override int GetHashCode()
        {
            var hashCode = 1814622215;
            hashCode = hashCode * -1521134295 + base.GetHashCode();
            hashCode = hashCode * -1521134295 + EqualityComparer<T>.Default.GetHashCode(_value);
            hashCode = hashCode * -1521134295 + HasValue.GetHashCode();
            return hashCode;
        }
    }
}
