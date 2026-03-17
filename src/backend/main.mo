import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
  };

  func logEntry(alertId : Text, timestamp : Text, symbol : Text, side : Text, signal : Text, status : Text, reason : Text) {
    auditLog.add({ alertId; timestamp; symbol; side; signal; status; reason; receivedAt = Time.now() });
    if (auditLog.size() > maxAuditLogEntries) {
      let arr = auditLog.toArray();
      while (auditLog.size() > 0) { ignore auditLog.removeLast() };
      var i = 1;
      while (i < arr.size()) { auditLog.add(arr[i]); i += 1 };
    };
  };

  public shared func receiveWebhook(
    alertId : Text, timestamp : Text, symbol : Text,
    side : Text, signal : Text, secretToken : Text,
  ) : async Text {
    cleanOldEntries();

    switch (webhookSecret) {
      case (?stored) {
        if (stored != secretToken) {
          logEntry(alertId, timestamp, symbol, side, signal, "rejected", "Invalid secret token");
          return "Rejected: Invalid secret token.";
        };
      };
      case (null) {
        logEntry(alertId, timestamp, symbol, side, signal, "rejected", "No secret token configured");
        return "Rejected: No webhook secret configured. Set a secret via admin panel.";
      };
    };

    if (not killSwitch) {
      logEntry(alertId, timestamp, symbol, side, signal, "rejected", "Kill switch is OFF - trading disabled");
      return "Rejected: Kill switch is OFF. Enable kill switch to allow trade execution.";
    };

    let now = Time.now();
    switch (deduplicationEntries.get(alertId)) {
      case (?ts) {
        if (now - ts < deduplicationWindowNanos) {
          logEntry(alertId, timestamp, symbol, side, signal, "rejected", "Duplicate alert_id within 90s window");
          return "Rejected: Duplicate alert received within 90-second window.";
        };
      };
      case (null) {};
    };
    deduplicationEntries.add(alertId, now);

    logEntry(alertId, timestamp, symbol, side, signal, "accepted", "All checks passed");
    "Accepted: Webhook processed successfully. Symbol: " # symbol # " Side: " # side;
  };

  public query ({ caller }) func getKillSwitchStatus() : async Bool {
    requireAdmin(caller); killSwitch;
  };
  public shared ({ caller }) func setKillSwitch(status : Bool) : async () {
    requireAdmin(caller); killSwitch := status;
  };
  public shared ({ caller }) func setWebhookSecret(secret : Text) : async () {
    requireAdmin(caller); webhookSecret := ?secret;
  };
  public query ({ caller }) func hasWebhookSecret() : async Bool {
    requireAdmin(caller); webhookSecret != null;
  };
  public query ({ caller }) func getAuditLog() : async [AuditLogEntry] {
    requireAdmin(caller); auditLog.toArray();
  };
  public shared ({ caller }) func setBinanceCredentials(apiKey : Text, apiSecret : Text) : async () {
    requireAdmin(caller);
    binanceApiKey := ?apiKey;
    binanceApiSecret := ?apiSecret;
  };
  public query ({ caller }) func hasBinanceCredentials() : async Bool {
    requireAdmin(caller);
    switch (binanceApiKey, binanceApiSecret) {
      case (?_, ?_) { true };
      case _ { false };
    };
  };
  public shared ({ caller }) func clearBinanceCredentials() : async () {
    requireAdmin(caller);
    binanceApiKey := null;
    binanceApiSecret := null;
  };
  public shared ({ caller }) func setTestnetMode(mode : Bool) : async () {
    requireAdmin(caller); testnetMode := mode;
  };
  public query ({ caller }) func getTestnetMode() : async Bool {
    requireAdmin(caller); testnetMode;
  };
  public shared ({ caller }) func setDefaultOrderQuantity(quantity : Text) : async () {
    requireAdmin(caller); defaultOrderQuantity := quantity;
  };
  public query ({ caller }) func getDefaultOrderQuantity() : async Text {
    requireAdmin(caller); defaultOrderQuantity;
  };

  func cleanOldEntries() {
    let now = Time.now();
    for ((id, ts) in deduplicationEntries.entries()) {
      if (now - ts > deduplicationWindowNanos) { deduplicationEntries.remove(id) };
    };
  };
};
