/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
namespace Plexus
{
    using System.IO;
    using System.Runtime.Serialization.Json;
    using System.Text;

    public static class JsonConvert {
        internal static readonly Encoding NoBomUtf8Encoding = new UTF8Encoding(false);

        public static T DeserializeFromFile<T>(string filePath) => JsonConvert<T>.DeserializeFromFile(filePath);
        public static T Deserialize<T>(Stream jsonStream) => JsonConvert<T>.Deserialize(jsonStream);
        public static T Deserialize<T>(string jsonText) => JsonConvert<T>.Deserialize(jsonText);
        public static string Serialize<T>(T obj) => JsonConvert<T>.Serialize(obj);
        public static void Serialize<T>(T obj, Stream stream) => JsonConvert<T>.Serialize(obj);
    }

    public static class JsonConvert<T>
    {
        private static readonly DataContractJsonSerializer Serializer = new DataContractJsonSerializer(typeof(T), new DataContractJsonSerializerSettings { UseSimpleDictionaryFormat = true });        

        public static T DeserializeFromFile(string jsonFilePath)
        {
            using (var stream = File.Open(jsonFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            {
                return Deserialize(stream);
            }
        }

        public static T Deserialize(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream, Encoding.UTF8))
            {
                return Deserialize(reader.ReadToEnd());
            }
        }

        public static T Deserialize(string jsonText)
        {
            using (var memoryStream = new MemoryStream())
            using (var streamWriter = new StreamWriter(memoryStream, JsonConvert.NoBomUtf8Encoding))
            {
                streamWriter.Write(jsonText);
                streamWriter.Flush();
                memoryStream.Position = 0;            
                return (T)Serializer.ReadObject(memoryStream);
            }
        }

        public static string Serialize(T obj)
        {
            using (var stream = new MemoryStream())
            {
                Serialize(obj, stream);
                stream.Position = 0;
                using (var reader = new StreamReader(stream, JsonConvert.NoBomUtf8Encoding))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        public static void Serialize(T obj, Stream stream)
        {
            Serializer.WriteObject(stream, obj);
        }
    }
}
