import Map "mo:core/Map";

module {
  type OldAlertRecord = {
    timestamp : Int;
    rsiValue : Float;
    price : Float;
  };

  type OldActor = {
    alertHistory : Map.Map<Int, OldAlertRecord>;
  };

  type NewActor = {};

  public func run(old : OldActor) : NewActor {
    {};
  };
};
