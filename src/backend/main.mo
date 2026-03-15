import Order "mo:core/Order";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type AlertRecord = {
    timestamp : Int;
    rsiValue : Float;
    price : Float;
  };

  module AlertRecord {
    public func compare(a : AlertRecord, b : AlertRecord) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  var alertHistory = Map.empty<Int, AlertRecord>();

  public query ({ caller }) func getAlertHistory() : async [AlertRecord] {
    alertHistory.values().toArray().sort();
  };

  public shared ({ caller }) func checkAndLogAlert(rsi : Float, price : Float) : async () {
    if (rsi >= 30.0) { Runtime.trap("RSI is not below 30, no alert logged") };
    let currentTime = Time.now();
    switch (alertHistory.get(currentTime)) {
      case (null) {
        let record : AlertRecord = {
          timestamp = currentTime;
          rsiValue = rsi;
          price;
        };
        alertHistory.add(currentTime, record);
        ();
      };
      case (?_) {};
    };
  };

  public shared ({ caller }) func clearAlertHistory() : async () {
    alertHistory.clear();
  };
};
