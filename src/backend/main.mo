import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration function to drop old persistent data
(with migration = Migration.run)
actor {
  // Kill switch defaults to false (OFF = trading disabled). Must be explicitly set to true to allow trades.
  var killSwitch = false;
  var webhookSecret : ?Text = null;
  let accessControlState = AccessControl.initState();

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

  type AuditLog = List.List<AuditLogEntry>;

  public type UserProfile = {
    name : Text;
  };

  let auditLog : AuditLog = List.empty<AuditLogEntry>();
  let deduplicationEntries = Map.empty<Text, Int>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinAuthorization(accessControlState);

  let deduplicationWindowNanos : Int = 90_000_000_000; // 90 seconds in nanoseconds
  let maxAuditLogEntries = 100;
  let maxDedupEntries = 1000;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Kill switch status - admin only
  public query ({ caller }) func getKillSwitchStatus() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view kill switch status");
    };
    killSwitch;
  };

  // Set kill switch - admin only
  public shared ({ caller }) func setKillSwitch(status : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set kill switch");
    };
    killSwitch := status;
  };

  // Set webhook secret - admin only
  public shared ({ caller }) func setWebhookSecret(secret : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set webhook secret");
    };
    webhookSecret := ?secret;
  };

  // Get audit log - admin only
  public query ({ caller }) func getAuditLog() : async [AuditLogEntry] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view audit log");
    };
    auditLog.toArray();
  };

  func cleanOldEntries() {
    let currentTime = Time.now();
    for ((alertId, timestamp) in deduplicationEntries.entries()) {
      if (currentTime - timestamp > deduplicationWindowNanos) {
        deduplicationEntries.remove(alertId);
      };
    };
  };

  func appendAuditLogEntry(newEntry : AuditLogEntry) {
    auditLog.add(newEntry);
    while (auditLog.size() > maxAuditLogEntries) {
      switch (auditLog.last()) {
        case (?_) { ignore auditLog.removeLast() };
        case (null) {};
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

  // Webhook receiver - publicly accessible, authorized via secret token
  public shared func receiveWebhook(alertId : Text, timestamp : Text, symbol : Text, side : Text, signal : Text, secretToken : Text) : async Text {
    cleanOldEntries();

    // Kill switch check: kill switch must be ON (true) to allow trades
    if (not killSwitch) {
      let logEntry = createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Kill switch is OFF - trading disabled");
      appendAuditLogEntry(logEntry);
      return "Rejected: Kill switch is OFF. Enable kill switch to allow trade execution.";
    };

    // Secret token verification
    switch (webhookSecret) {
      case (?storedSecret) {
        if (storedSecret != secretToken) {
          let logEntry = createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Invalid secret token");
          appendAuditLogEntry(logEntry);
          return "Rejected: Invalid secret token.";
        };
      };
      case (null) {
        let logEntry = createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "No secret token configured");
        appendAuditLogEntry(logEntry);
        return "Rejected: No webhook secret configured. Set a secret via admin panel.";
      };
    };

    // Deduplication check
    let currentTime = Time.now();
    switch (deduplicationEntries.get(alertId)) {
      case (?existingTimestamp) {
        if (currentTime - existingTimestamp < deduplicationWindowNanos) {
          let logEntry = createAuditLogEntry(alertId, timestamp, symbol, side, signal, "rejected", "Duplicate alert_id within 90s window");
          appendAuditLogEntry(logEntry);
          return "Rejected: Duplicate alert received within 90-second window.";
        };
      };
      case (null) {};
    };
    deduplicationEntries.add(alertId, currentTime);

    // All checks passed - log accepted alert
    let logEntry = createAuditLogEntry(alertId, timestamp, symbol, side, signal, "accepted", "All checks passed");
    appendAuditLogEntry(logEntry);

    "Accepted: Webhook processed successfully. Symbol: " # symbol # " Side: " # side;
  };
};
