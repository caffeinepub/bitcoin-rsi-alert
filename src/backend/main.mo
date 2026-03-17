import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  var killSwitch = false;
  var webhookSecret : ?Text = null;

  var binanceApiKey : ?Text = null;
  var binanceApiSecret : ?Text = null;

  var testnetMode : Bool = true;
  var defaultOrderQuantity : Text = "0.001";

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type AuditLogEntry = {
    alertId : Text;
    timestamp : Text;
    symbol : Text;
    side : Text;
    signal : Text;
    status : Text;
    reason : Text;
    receivedAt : Int;
  };

  let auditLog = List.empty<AuditLogEntry>();
  let deduplicationEntries = Map.empty<Text, Int>();

  let deduplicationWindowNanos : Int = 90_000_000_000;
  let maxAuditLogEntries = 100;

  // Webhook receiver - publicly accessible, token validation is FIRST security gate
  public shared func receiveWebhook(
    alertId : Text,
    timestamp : Text,
    symbol : Text,
    side : Text,
    signal : Text,
    secretToken : Text,
  ) : async Text {
    cleanOldEntries();

    // Gate 1: Secret token validation (must be first to prevent info leaks)
    switch (webhookSecret) {
      case (?storedSecret) {
        if (storedSecret != secretToken) {
          appendAuditLogEntry(createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Invalid secret token"));
          return "Rejected: Invalid secret token.";
        };
      };
      case (null) {
        appendAuditLogEntry(createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "No secret token configured"));
        return "Rejected: No webhook secret configured. Set a secret via admin panel.";
      };
    };

    // Gate 2: Kill switch must be ON
    if (not killSwitch) {
      appendAuditLogEntry(createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Kill switch is OFF - trading disabled"));
      return "Rejected: Kill switch is OFF. Enable kill switch to allow trade execution.";
    };

    // Gate 3: Deduplication
    let currentTime = Time.now();
    switch (deduplicationEntries.get(alertId)) {
      case (?existingTimestamp) {
        if (currentTime - existingTimestamp < deduplicationWindowNanos) {
          appendAuditLogEntry(createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Duplicate alert_id within 90s window"));
          return "Rejected: Duplicate alert received within 90-second window.";
        };
      };
      case (null) {};
    };
    deduplicationEntries.add(alertId, currentTime);

    // All gates passed
    appendAuditLogEntry(createAuditLogEntry(alertId, timestamp, symbol, side, signal, "accepted", "All checks passed"));
    "Accepted: Webhook processed successfully. Symbol: " # symbol # " Side: " # side;
  };

  public query ({ caller }) func getKillSwitchStatus() : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    killSwitch;
  };

  public shared ({ caller }) func setKillSwitch(status : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    killSwitch := status;
  };

  public shared ({ caller }) func setWebhookSecret(secret : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    webhookSecret := ?secret;
  };

  public query ({ caller }) func hasWebhookSecret() : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    webhookSecret != null;
  };

  public query ({ caller }) func getAuditLog() : async [AuditLogEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    auditLog.toArray();
  };

  public shared ({ caller }) func setBinanceCredentials(apiKey : Text, apiSecret : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    binanceApiKey := ?apiKey;
    binanceApiSecret := ?apiSecret;
  };

  public query ({ caller }) func hasBinanceCredentials() : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    switch (binanceApiKey, binanceApiSecret) {
      case (?_, ?_) { true };
      case _ { false };
    };
  };

  public shared ({ caller }) func clearBinanceCredentials() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    binanceApiKey := null;
    binanceApiSecret := null;
  };

  public shared ({ caller }) func setTestnetMode(mode : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    testnetMode := mode;
  };

  public query ({ caller }) func getTestnetMode() : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    testnetMode;
  };

  public shared ({ caller }) func setDefaultOrderQuantity(quantity : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    defaultOrderQuantity := quantity;
  };

  public query ({ caller }) func getDefaultOrderQuantity() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    defaultOrderQuantity;
  };

  func cleanOldEntries() {
    let currentTime = Time.now();
    for ((alertId, ts) in deduplicationEntries.entries()) {
      if (currentTime - ts > deduplicationWindowNanos) {
        deduplicationEntries.remove(alertId);
      };
    };
  };

  // Append new entry; when over limit, drop the oldest by snapshotting,
  // draining the list, then re-adding all except the first (oldest) entry.
  // Uses only removeLast/toArray/add/size which are confirmed on mo:core/List.
  func appendAuditLogEntry(newEntry : AuditLogEntry) {
    auditLog.add(newEntry);
    if (auditLog.size() > maxAuditLogEntries) {
      let arr = auditLog.toArray();
      while (auditLog.size() > 0) {
        ignore auditLog.removeLast();
      };
      // Re-add everything except index 0 (the oldest entry)
      var i = 1;
      while (i < arr.size()) {
        auditLog.add(arr[i]);
        i += 1;
      };
    };
  };

  func createAuditLogEntry(
    alertId : Text,
    timestamp : Text,
    symbol : Text,
    side : Text,
    signal : Text,
    status : Text,
    reason : Text,
  ) : AuditLogEntry {
    {
      alertId;
      timestamp;
      symbol;
      side;
      signal;
      status;
      reason;
      receivedAt = Time.now();
    };
  };
};
