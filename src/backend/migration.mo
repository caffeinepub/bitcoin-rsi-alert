import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldAuditLogEntry = {
    alertId : Text;
    timestamp : Text;
    symbol : Text;
    side : Text;
    signal : Text;
    status : Text;
    reason : Text;
    receivedAt : Int;
  };

  type OldActor = {
    killSwitch : Bool;
    webhookSecret : ?Text;
    binanceApiKey : ?Text;
    binanceApiSecret : ?Text;
    testnetMode : Bool;
    defaultOrderQuantity : Text;
    accessControlState : AccessControl.AccessControlState;
    auditLog : List.List<OldAuditLogEntry>;
    deduplicationEntries : Map.Map<Text, Int>;
    // Now-removed fields from old actor version
    userProfiles : Map.Map<Principal, { name : Text }>;
    maxDedupEntries : Nat;
  };

  type NewAuditLogEntry = {
    alertId : Text;
    timestamp : Text;
    symbol : Text;
    side : Text;
    signal : Text;
    status : Text;
    reason : Text;
    receivedAt : Int;
  };

  type NewActor = {
    killSwitch : Bool;
    webhookSecret : ?Text;
    binanceApiKey : ?Text;
    binanceApiSecret : ?Text;
    testnetMode : Bool;
    defaultOrderQuantity : Text;
    accessControlState : AccessControl.AccessControlState;
    auditLog : List.List<NewAuditLogEntry>;
    deduplicationEntries : Map.Map<Text, Int>;
    // userProfiles and maxDedupEntries are intentionally omitted in new type
  };

  public func run(old : OldActor) : NewActor {
    {
      killSwitch = old.killSwitch;
      webhookSecret = old.webhookSecret;
      binanceApiKey = old.binanceApiKey;
      binanceApiSecret = old.binanceApiSecret;
      testnetMode = old.testnetMode;
      defaultOrderQuantity = old.defaultOrderQuantity;
      accessControlState = old.accessControlState;
      auditLog = old.auditLog;
      deduplicationEntries = old.deduplicationEntries;
      // userProfiles and maxDedupEntries are intentionally dropped here
    };
  };
};
