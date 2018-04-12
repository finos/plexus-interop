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
﻿namespace Plexus
{
    using System;
    using System.Linq;
    using System.Runtime.CompilerServices;
    using System.Runtime.InteropServices;

    // This class keeps UUID bytes in little-endian order
    [StructLayout(LayoutKind.Sequential)]
    public struct UniqueId : IEquatable<UniqueId>
    {
        public static readonly UniqueId Empty = new UniqueId(0, 0);

        private readonly string _string;

        private UniqueId(ulong hi, ulong lo)
        {
            Hi = hi;
            Lo = lo;
            var hiPart = BitConverter.GetBytes(hi);
            var loPart = BitConverter.GetBytes(lo);
            if (BitConverter.IsLittleEndian)
            {
                Reverse(hiPart, 0, 8);
                Reverse(loPart, 0, 8);
            }
            var bytes = hiPart.Concat(loPart).ToArray();
            _string = BitConverter.ToString(bytes).Replace("-", "");
        }
        
        public ulong Hi { get; }

        public ulong Lo { get; }

        public string String => _string ?? Empty.String;

        public static UniqueId Generate()
        {
            var guid = Guid.NewGuid();
            var bytes = guid.ToByteArray();
            if (BitConverter.IsLittleEndian)
            {
                Convert(bytes);
            }
            Reverse(bytes, 0, 16);
            var hi = GetLong(bytes, 0);
            var lo = GetLong(bytes, 8);            
            return new UniqueId(hi, lo);
        }

        public static UniqueId FromString(string value)
        {
            var bytes = HexStringToByteArray(value);
            return new UniqueId(GetLong(bytes, 0), GetLong(bytes, 8));
        }

        public static UniqueId FromHiLo(ulong hi, ulong lo)
        {
            return new UniqueId(hi, lo);
        }

        public override string ToString()
        {
            return String;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void Reverse(byte[] bytes, int from, int to)
        {
            for (var i = from; i < (to - from) / 2; i++)
            {
                var t = bytes[i];                
                bytes[i] = bytes[to - i - 1];
                bytes[to - i - 1] = t;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static void Convert(byte[] guidBytes)
        {
            // reverse first 4 bytes
            var t = guidBytes[0];
            guidBytes[0] = guidBytes[3];
            guidBytes[3] = t;
            guidBytes[3] = t;
            t = guidBytes[1];
            guidBytes[1] = guidBytes[2];
            guidBytes[2] = t;

            // reverse next 2 bytes
            t = guidBytes[4];
            guidBytes[4] = guidBytes[5];
            guidBytes[5] = t;

            // reverse next 2 bytes
            t = guidBytes[6];
            guidBytes[6] = guidBytes[7];
            guidBytes[7] = t;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static byte[] HexStringToByteArray(string hex)
        {
            if (hex.Length % 2 == 1)
            {
                throw new Exception("The binary key cannot have an odd number of digits");
            }

            var arr = new byte[hex.Length >> 1];

            for (var i = 0; i < hex.Length >> 1; ++i)
            {
                arr[i] = (byte)((GetHexVal(hex[i << 1]) << 4) + (GetHexVal(hex[(i << 1) + 1])));
            }

            return arr;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private static int GetHexVal(char hex)
        {
            var val = (int)hex;
            //For uppercase A-F letters:
            return val - (val < 58 ? 48 : 55);
        }

        private static ulong GetLong(byte[] bytes, int i)
        {
            ulong x = 0;
            for (var j = 0; j < 8; j++)
            {
                x = (x << 8) | bytes[i + j];
            }
            return x;
        }

        public static bool operator ==(UniqueId left, UniqueId right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(UniqueId left, UniqueId right)
        {
            return !left.Equals(right);
        }

        public bool Equals(UniqueId other)
        {
            return Hi == other.Hi && Lo == other.Lo;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            return obj is UniqueId && Equals((UniqueId) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (Hi.GetHashCode() * 397) ^ Lo.GetHashCode();
            }
        }
    }
}
