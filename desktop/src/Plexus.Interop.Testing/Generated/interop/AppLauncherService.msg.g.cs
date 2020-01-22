/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
// <auto-generated>
//     Generated by the protocol buffer compiler.  DO NOT EDIT!
//     source: interop/app_launcher_service.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code

using pb = global::Google.Protobuf;
using pbc = global::Google.Protobuf.Collections;
using pbr = global::Google.Protobuf.Reflection;
using scg = global::System.Collections.Generic;
namespace Plexus.Interop.Testing.Generated {

  /// <summary>Holder for reflection information generated from interop/app_launcher_service.proto</summary>
  public static partial class AppLauncherServiceReflection {

    #region Descriptor
    /// <summary>File descriptor for interop/app_launcher_service.proto</summary>
    public static pbr::FileDescriptor Descriptor {
      get { return descriptor; }
    }
    private static pbr::FileDescriptor descriptor;

    static AppLauncherServiceReflection() {
      byte[] descriptorData = global::System.Convert.FromBase64String(
          string.Concat(
            "CiJpbnRlcm9wL2FwcF9sYXVuY2hlcl9zZXJ2aWNlLnByb3RvEgdpbnRlcm9w",
            "Ghtnb29nbGUvcHJvdG9idWYvZW1wdHkucHJvdG8aF2ludGVyb3AvdW5pcXVl",
            "X2lkLnByb3RvGh1pbnRlcm9wL2FwcF9sYXVuY2hfbW9kZS5wcm90bxoVaW50",
            "ZXJvcC9vcHRpb25zLnByb3RvIu0BChBBcHBMYXVuY2hSZXF1ZXN0Eg4KBmFw",
            "cF9pZBgBIAEoCRIaChJsYXVuY2hfcGFyYW1zX2pzb24YAiABKAkSKwoLbGF1",
            "bmNoX21vZGUYAyABKA4yFi5pbnRlcm9wLkFwcExhdW5jaE1vZGUSNAoZc3Vn",
            "Z2VzdGVkX2FwcF9pbnN0YW5jZV9pZBgEIAEoCzIRLmludGVyb3AuVW5pcXVl",
            "SWQSLAoIcmVmZXJyZXIYBSABKAsyGi5pbnRlcm9wLkFwcExhdW5jaFJlZmVy",
            "cmVyOhyS2wQYaW50ZXJvcC5BcHBMYXVuY2hSZXF1ZXN0IpgBChFBcHBMYXVu",
            "Y2hSZWZlcnJlchIOCgZhcHBfaWQYASABKAkSKgoPYXBwX2luc3RhbmNlX2lk",
            "GAIgASgLMhEuaW50ZXJvcC5VbmlxdWVJZBIoCg1jb25uZWN0aW9uX2lkGAMg",
            "ASgLMhEuaW50ZXJvcC5VbmlxdWVJZDodktsEGWludGVyb3AuQXBwTGF1bmNo",
            "UmVmZXJyZXIiXgoRQXBwTGF1bmNoUmVzcG9uc2USKgoPYXBwX2luc3RhbmNl",
            "X2lkGAEgASgLMhEuaW50ZXJvcC5VbmlxdWVJZDodktsEGWludGVyb3AuQXBw",
            "TGF1bmNoUmVzcG9uc2UimwEKEEFwcExhdW5jaGVkRXZlbnQSKgoPYXBwX2lu",
            "c3RhbmNlX2lkGAEgASgLMhEuaW50ZXJvcC5VbmlxdWVJZBIPCgdhcHBfaWRz",
            "GAIgAygJEiwKCHJlZmVycmVyGAMgASgLMhouaW50ZXJvcC5BcHBMYXVuY2hS",
            "ZWZlcnJlcjocktsEGGludGVyb3AuQXBwTGF1bmNoZWRFdmVudDLEAQoSQXBw",
            "TGF1bmNoZXJTZXJ2aWNlEj8KBkxhdW5jaBIZLmludGVyb3AuQXBwTGF1bmNo",
            "UmVxdWVzdBoaLmludGVyb3AuQXBwTGF1bmNoUmVzcG9uc2USTQoWQXBwTGF1",
            "bmNoZWRFdmVudFN0cmVhbRIWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eRoZLmlu",
            "dGVyb3AuQXBwTGF1bmNoZWRFdmVudDABGh6S2wQaaW50ZXJvcC5BcHBMYXVu",
            "Y2hlclNlcnZpY2VCI6oCIFBsZXh1cy5JbnRlcm9wLlRlc3RpbmcuR2VuZXJh",
            "dGVkYgZwcm90bzM="));
      descriptor = pbr::FileDescriptor.FromGeneratedCode(descriptorData,
          new pbr::FileDescriptor[] { global::Google.Protobuf.WellKnownTypes.EmptyReflection.Descriptor, global::Plexus.Interop.Testing.Generated.UniqueIdReflection.Descriptor, global::Plexus.Interop.Testing.Generated.AppLaunchModeReflection.Descriptor, global::Plexus.Interop.Testing.Generated.OptionsReflection.Descriptor, },
          new pbr::GeneratedClrTypeInfo(null, new pbr::GeneratedClrTypeInfo[] {
            new pbr::GeneratedClrTypeInfo(typeof(global::Plexus.Interop.Testing.Generated.AppLaunchRequest), global::Plexus.Interop.Testing.Generated.AppLaunchRequest.Parser, new[]{ "AppId", "LaunchParamsJson", "LaunchMode", "SuggestedAppInstanceId", "Referrer" }, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Plexus.Interop.Testing.Generated.AppLaunchReferrer), global::Plexus.Interop.Testing.Generated.AppLaunchReferrer.Parser, new[]{ "AppId", "AppInstanceId", "ConnectionId" }, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Plexus.Interop.Testing.Generated.AppLaunchResponse), global::Plexus.Interop.Testing.Generated.AppLaunchResponse.Parser, new[]{ "AppInstanceId" }, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Plexus.Interop.Testing.Generated.AppLaunchedEvent), global::Plexus.Interop.Testing.Generated.AppLaunchedEvent.Parser, new[]{ "AppInstanceId", "AppIds", "Referrer" }, null, null, null)
          }));
    }
    #endregion

  }
  #region Messages
  public sealed partial class AppLaunchRequest : pb::IMessage<AppLaunchRequest> {
    private static readonly pb::MessageParser<AppLaunchRequest> _parser = new pb::MessageParser<AppLaunchRequest>(() => new AppLaunchRequest());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<AppLaunchRequest> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Plexus.Interop.Testing.Generated.AppLauncherServiceReflection.Descriptor.MessageTypes[0]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchRequest() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchRequest(AppLaunchRequest other) : this() {
      appId_ = other.appId_;
      launchParamsJson_ = other.launchParamsJson_;
      launchMode_ = other.launchMode_;
      SuggestedAppInstanceId = other.suggestedAppInstanceId_ != null ? other.SuggestedAppInstanceId.Clone() : null;
      Referrer = other.referrer_ != null ? other.Referrer.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchRequest Clone() {
      return new AppLaunchRequest(this);
    }

    /// <summary>Field number for the "app_id" field.</summary>
    public const int AppIdFieldNumber = 1;
    private string appId_ = "";
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public string AppId {
      get { return appId_; }
      set {
        appId_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }

    /// <summary>Field number for the "launch_params_json" field.</summary>
    public const int LaunchParamsJsonFieldNumber = 2;
    private string launchParamsJson_ = "";
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public string LaunchParamsJson {
      get { return launchParamsJson_; }
      set {
        launchParamsJson_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }

    /// <summary>Field number for the "launch_mode" field.</summary>
    public const int LaunchModeFieldNumber = 3;
    private global::Plexus.Interop.Testing.Generated.AppLaunchMode launchMode_ = 0;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.AppLaunchMode LaunchMode {
      get { return launchMode_; }
      set {
        launchMode_ = value;
      }
    }

    /// <summary>Field number for the "suggested_app_instance_id" field.</summary>
    public const int SuggestedAppInstanceIdFieldNumber = 4;
    private global::Plexus.Interop.Testing.Generated.UniqueId suggestedAppInstanceId_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.UniqueId SuggestedAppInstanceId {
      get { return suggestedAppInstanceId_; }
      set {
        suggestedAppInstanceId_ = value;
      }
    }

    /// <summary>Field number for the "referrer" field.</summary>
    public const int ReferrerFieldNumber = 5;
    private global::Plexus.Interop.Testing.Generated.AppLaunchReferrer referrer_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.AppLaunchReferrer Referrer {
      get { return referrer_; }
      set {
        referrer_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as AppLaunchRequest);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(AppLaunchRequest other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (AppId != other.AppId) return false;
      if (LaunchParamsJson != other.LaunchParamsJson) return false;
      if (LaunchMode != other.LaunchMode) return false;
      if (!object.Equals(SuggestedAppInstanceId, other.SuggestedAppInstanceId)) return false;
      if (!object.Equals(Referrer, other.Referrer)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (AppId.Length != 0) hash ^= AppId.GetHashCode();
      if (LaunchParamsJson.Length != 0) hash ^= LaunchParamsJson.GetHashCode();
      if (LaunchMode != 0) hash ^= LaunchMode.GetHashCode();
      if (suggestedAppInstanceId_ != null) hash ^= SuggestedAppInstanceId.GetHashCode();
      if (referrer_ != null) hash ^= Referrer.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
      if (AppId.Length != 0) {
        output.WriteRawTag(10);
        output.WriteString(AppId);
      }
      if (LaunchParamsJson.Length != 0) {
        output.WriteRawTag(18);
        output.WriteString(LaunchParamsJson);
      }
      if (LaunchMode != 0) {
        output.WriteRawTag(24);
        output.WriteEnum((int) LaunchMode);
      }
      if (suggestedAppInstanceId_ != null) {
        output.WriteRawTag(34);
        output.WriteMessage(SuggestedAppInstanceId);
      }
      if (referrer_ != null) {
        output.WriteRawTag(42);
        output.WriteMessage(Referrer);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (AppId.Length != 0) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(AppId);
      }
      if (LaunchParamsJson.Length != 0) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(LaunchParamsJson);
      }
      if (LaunchMode != 0) {
        size += 1 + pb::CodedOutputStream.ComputeEnumSize((int) LaunchMode);
      }
      if (suggestedAppInstanceId_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(SuggestedAppInstanceId);
      }
      if (referrer_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(Referrer);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(AppLaunchRequest other) {
      if (other == null) {
        return;
      }
      if (other.AppId.Length != 0) {
        AppId = other.AppId;
      }
      if (other.LaunchParamsJson.Length != 0) {
        LaunchParamsJson = other.LaunchParamsJson;
      }
      if (other.LaunchMode != 0) {
        LaunchMode = other.LaunchMode;
      }
      if (other.suggestedAppInstanceId_ != null) {
        if (suggestedAppInstanceId_ == null) {
          suggestedAppInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
        }
        SuggestedAppInstanceId.MergeFrom(other.SuggestedAppInstanceId);
      }
      if (other.referrer_ != null) {
        if (referrer_ == null) {
          referrer_ = new global::Plexus.Interop.Testing.Generated.AppLaunchReferrer();
        }
        Referrer.MergeFrom(other.Referrer);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            AppId = input.ReadString();
            break;
          }
          case 18: {
            LaunchParamsJson = input.ReadString();
            break;
          }
          case 24: {
            launchMode_ = (global::Plexus.Interop.Testing.Generated.AppLaunchMode) input.ReadEnum();
            break;
          }
          case 34: {
            if (suggestedAppInstanceId_ == null) {
              suggestedAppInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
            }
            input.ReadMessage(suggestedAppInstanceId_);
            break;
          }
          case 42: {
            if (referrer_ == null) {
              referrer_ = new global::Plexus.Interop.Testing.Generated.AppLaunchReferrer();
            }
            input.ReadMessage(referrer_);
            break;
          }
        }
      }
    }

  }

  public sealed partial class AppLaunchReferrer : pb::IMessage<AppLaunchReferrer> {
    private static readonly pb::MessageParser<AppLaunchReferrer> _parser = new pb::MessageParser<AppLaunchReferrer>(() => new AppLaunchReferrer());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<AppLaunchReferrer> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Plexus.Interop.Testing.Generated.AppLauncherServiceReflection.Descriptor.MessageTypes[1]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchReferrer() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchReferrer(AppLaunchReferrer other) : this() {
      appId_ = other.appId_;
      AppInstanceId = other.appInstanceId_ != null ? other.AppInstanceId.Clone() : null;
      ConnectionId = other.connectionId_ != null ? other.ConnectionId.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchReferrer Clone() {
      return new AppLaunchReferrer(this);
    }

    /// <summary>Field number for the "app_id" field.</summary>
    public const int AppIdFieldNumber = 1;
    private string appId_ = "";
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public string AppId {
      get { return appId_; }
      set {
        appId_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }

    /// <summary>Field number for the "app_instance_id" field.</summary>
    public const int AppInstanceIdFieldNumber = 2;
    private global::Plexus.Interop.Testing.Generated.UniqueId appInstanceId_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.UniqueId AppInstanceId {
      get { return appInstanceId_; }
      set {
        appInstanceId_ = value;
      }
    }

    /// <summary>Field number for the "connection_id" field.</summary>
    public const int ConnectionIdFieldNumber = 3;
    private global::Plexus.Interop.Testing.Generated.UniqueId connectionId_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.UniqueId ConnectionId {
      get { return connectionId_; }
      set {
        connectionId_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as AppLaunchReferrer);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(AppLaunchReferrer other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (AppId != other.AppId) return false;
      if (!object.Equals(AppInstanceId, other.AppInstanceId)) return false;
      if (!object.Equals(ConnectionId, other.ConnectionId)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (AppId.Length != 0) hash ^= AppId.GetHashCode();
      if (appInstanceId_ != null) hash ^= AppInstanceId.GetHashCode();
      if (connectionId_ != null) hash ^= ConnectionId.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
      if (AppId.Length != 0) {
        output.WriteRawTag(10);
        output.WriteString(AppId);
      }
      if (appInstanceId_ != null) {
        output.WriteRawTag(18);
        output.WriteMessage(AppInstanceId);
      }
      if (connectionId_ != null) {
        output.WriteRawTag(26);
        output.WriteMessage(ConnectionId);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (AppId.Length != 0) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(AppId);
      }
      if (appInstanceId_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(AppInstanceId);
      }
      if (connectionId_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(ConnectionId);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(AppLaunchReferrer other) {
      if (other == null) {
        return;
      }
      if (other.AppId.Length != 0) {
        AppId = other.AppId;
      }
      if (other.appInstanceId_ != null) {
        if (appInstanceId_ == null) {
          appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
        }
        AppInstanceId.MergeFrom(other.AppInstanceId);
      }
      if (other.connectionId_ != null) {
        if (connectionId_ == null) {
          connectionId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
        }
        ConnectionId.MergeFrom(other.ConnectionId);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            AppId = input.ReadString();
            break;
          }
          case 18: {
            if (appInstanceId_ == null) {
              appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
            }
            input.ReadMessage(appInstanceId_);
            break;
          }
          case 26: {
            if (connectionId_ == null) {
              connectionId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
            }
            input.ReadMessage(connectionId_);
            break;
          }
        }
      }
    }

  }

  public sealed partial class AppLaunchResponse : pb::IMessage<AppLaunchResponse> {
    private static readonly pb::MessageParser<AppLaunchResponse> _parser = new pb::MessageParser<AppLaunchResponse>(() => new AppLaunchResponse());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<AppLaunchResponse> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Plexus.Interop.Testing.Generated.AppLauncherServiceReflection.Descriptor.MessageTypes[2]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchResponse() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchResponse(AppLaunchResponse other) : this() {
      AppInstanceId = other.appInstanceId_ != null ? other.AppInstanceId.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchResponse Clone() {
      return new AppLaunchResponse(this);
    }

    /// <summary>Field number for the "app_instance_id" field.</summary>
    public const int AppInstanceIdFieldNumber = 1;
    private global::Plexus.Interop.Testing.Generated.UniqueId appInstanceId_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.UniqueId AppInstanceId {
      get { return appInstanceId_; }
      set {
        appInstanceId_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as AppLaunchResponse);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(AppLaunchResponse other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (!object.Equals(AppInstanceId, other.AppInstanceId)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (appInstanceId_ != null) hash ^= AppInstanceId.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
      if (appInstanceId_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(AppInstanceId);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (appInstanceId_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(AppInstanceId);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(AppLaunchResponse other) {
      if (other == null) {
        return;
      }
      if (other.appInstanceId_ != null) {
        if (appInstanceId_ == null) {
          appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
        }
        AppInstanceId.MergeFrom(other.AppInstanceId);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            if (appInstanceId_ == null) {
              appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
            }
            input.ReadMessage(appInstanceId_);
            break;
          }
        }
      }
    }

  }

  public sealed partial class AppLaunchedEvent : pb::IMessage<AppLaunchedEvent> {
    private static readonly pb::MessageParser<AppLaunchedEvent> _parser = new pb::MessageParser<AppLaunchedEvent>(() => new AppLaunchedEvent());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<AppLaunchedEvent> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Plexus.Interop.Testing.Generated.AppLauncherServiceReflection.Descriptor.MessageTypes[3]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchedEvent() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchedEvent(AppLaunchedEvent other) : this() {
      AppInstanceId = other.appInstanceId_ != null ? other.AppInstanceId.Clone() : null;
      appIds_ = other.appIds_.Clone();
      Referrer = other.referrer_ != null ? other.Referrer.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public AppLaunchedEvent Clone() {
      return new AppLaunchedEvent(this);
    }

    /// <summary>Field number for the "app_instance_id" field.</summary>
    public const int AppInstanceIdFieldNumber = 1;
    private global::Plexus.Interop.Testing.Generated.UniqueId appInstanceId_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.UniqueId AppInstanceId {
      get { return appInstanceId_; }
      set {
        appInstanceId_ = value;
      }
    }

    /// <summary>Field number for the "app_ids" field.</summary>
    public const int AppIdsFieldNumber = 2;
    private static readonly pb::FieldCodec<string> _repeated_appIds_codec
        = pb::FieldCodec.ForString(18);
    private readonly pbc::RepeatedField<string> appIds_ = new pbc::RepeatedField<string>();
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public pbc::RepeatedField<string> AppIds {
      get { return appIds_; }
    }

    /// <summary>Field number for the "referrer" field.</summary>
    public const int ReferrerFieldNumber = 3;
    private global::Plexus.Interop.Testing.Generated.AppLaunchReferrer referrer_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Plexus.Interop.Testing.Generated.AppLaunchReferrer Referrer {
      get { return referrer_; }
      set {
        referrer_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as AppLaunchedEvent);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(AppLaunchedEvent other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (!object.Equals(AppInstanceId, other.AppInstanceId)) return false;
      if(!appIds_.Equals(other.appIds_)) return false;
      if (!object.Equals(Referrer, other.Referrer)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (appInstanceId_ != null) hash ^= AppInstanceId.GetHashCode();
      hash ^= appIds_.GetHashCode();
      if (referrer_ != null) hash ^= Referrer.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
      if (appInstanceId_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(AppInstanceId);
      }
      appIds_.WriteTo(output, _repeated_appIds_codec);
      if (referrer_ != null) {
        output.WriteRawTag(26);
        output.WriteMessage(Referrer);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (appInstanceId_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(AppInstanceId);
      }
      size += appIds_.CalculateSize(_repeated_appIds_codec);
      if (referrer_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(Referrer);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(AppLaunchedEvent other) {
      if (other == null) {
        return;
      }
      if (other.appInstanceId_ != null) {
        if (appInstanceId_ == null) {
          appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
        }
        AppInstanceId.MergeFrom(other.AppInstanceId);
      }
      appIds_.Add(other.appIds_);
      if (other.referrer_ != null) {
        if (referrer_ == null) {
          referrer_ = new global::Plexus.Interop.Testing.Generated.AppLaunchReferrer();
        }
        Referrer.MergeFrom(other.Referrer);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            if (appInstanceId_ == null) {
              appInstanceId_ = new global::Plexus.Interop.Testing.Generated.UniqueId();
            }
            input.ReadMessage(appInstanceId_);
            break;
          }
          case 18: {
            appIds_.AddEntriesFrom(input, _repeated_appIds_codec);
            break;
          }
          case 26: {
            if (referrer_ == null) {
              referrer_ = new global::Plexus.Interop.Testing.Generated.AppLaunchReferrer();
            }
            input.ReadMessage(referrer_);
            break;
          }
        }
      }
    }

  }

  #endregion

}

#endregion Designer generated code
