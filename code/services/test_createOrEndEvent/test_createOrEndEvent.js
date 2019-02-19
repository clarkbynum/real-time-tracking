// stubbed ClearBlade functions so we don't really hit the db
function publish(topic, msg) {
  log({ topic, msg });
}
function noOp() {
  return;
}
var ClearBlade = {
  Messaging: function () {
    return { publish };
  },
  Collection: function () {
    return {
      update: noOp,
      create: function (arg1, callback) {
        callback(false, [{ item_id: Math.random() }]);
      }
    };
  },
  Query: function () {
    return {
      equalTo: noOp
    };
  }
};

function test_createOrEndEvent(req, resp) {
  var expect = chai.expect;

  var coordinates = JSON.stringify([
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ]);

  var eventTypes = {
    areaID_123: { item_id: "areaID_123", name: "area" },
    proximityID_123: { item_id: "proximityID_123", name: "proximity" }
  };

  var args = {
    eventDef: {
      item_id: "anyTooClose",
      threshold: 10,
      is_inside: true,
      event_type_id: "proximityID_123"
    },
    msgBody: { item_id: "Tom", name: "Tom", x_pos: 5, y_pos: 5 },
    areas: { office: { item_id: "office", coordinates } },
    entities: {
      Spot: {
        item_id: "Spot",
        name: "Spot",
        x_pos: 5,
        y_pos: 5,
        entity_type_id: "myEntityType"
      },
      Tom: { item_id: "Tom", name: "Tom", x_pos: 5, y_pos: 5 }
    },
    events: {},
    eventTypes,
    eventActivity: {}
  };

  // This series of tests builds on each other
  // since we keep an in memory cache of the db changes by mutating events and eventActivity
  // we test the side effects by looking at how those change
  // this is an integration test, there are more targeted pure unit tests of the functions

  createOrEndEvent(args);

  expect(values(args.events)[0], "creates any too close").to.containSubset({
    event_definition_id: "anyTooClose",
    active: true,
    entity_id: "Tom",
    entity2_id: "Spot"
  });

  log(values(args.eventActivity));

  expect(
    JSON.parse(values(args.eventActivity)[0].entity_data),
    "creates event Activity"
  ).to.containSubset({
    name: "Tom",
    x_pos: 5,
    y_pos: 5
  });

  createOrEndEvent(args);

  expect(
    values(args.events),
    "doesn't create multiple for same event"
  ).to.have.length(1);

  expect(
    values(args.eventActivity),
    "does create a new event activity for each new msg of same event"
  ).to.have.length(2);

  args.msgBody.name = "Spot";
  args.msgBody.item_id = "Spot";

  createOrEndEvent(args);

  expect(
    values(args.events),
    "doesn't create multiple for same event with other entity moved"
  ).to.have.length(1);
  expect(
    values(args.eventActivity),
    "does create a new event activity for each new msg of same event"
  ).to.have.length(3);


  args.msgBody.x_pos = null;
  args.msgBody.y_pos = null;

  createOrEndEvent(args);
  log(JSON.stringify(args.eventActivity, null, 2))

  expect(
    values(args.events),
    "doesn't do anything when null"
  ).to.have.length(1);
  expect(
    values(args.eventActivity),
    "doesn't do anything when null"
  ).to.have.length(3);

  args.msgBody.x_pos = 15;
  args.msgBody.y_pos = 15;

  createOrEndEvent(args);

  expect(
    values(args.events)[0],
    "changes event to false when no longer meeting conditions"
  ).to.containSubset({
    event_definition_id: "anyTooClose",
    active: false,
    entity_id: "Tom",
    entity2_id: "Spot"
  });

  expect(
    values(args.eventActivity),
    "doesn't create a new event activity when event has ended"
  ).to.have.length(3);

  args.msgBody.x_pos = 5;
  args.msgBody.y_pos = 5;

  createOrEndEvent(args);

  expect(
    values(args.events),
    "creates a new event when old matching event has ended"
  ).to.have.length(2);

  args.eventDef = {
    item_id: "insideOffice",
    is_inside: true,
    event_type_id: "areaID_123"
  };
  createOrEndEvent(args);

  log(values(args.events));
  expect(values(args.events)[2], "creates area event").to.containSubset({
    event_definition_id: "insideOffice",
    active: true,
    entity_id: "Spot",
    area_id: "office"
  });

  createOrEndEvent(args);

  expect(
    values(args.events),
    "doesn't create multiple for same area event"
  ).to.have.length(3);

  var argsMulti = {
    eventDef: {
      item_id: "dogTooCloseToPerson",
      threshold: 10,
      is_inside: true,
      entity_type_id: "person",
      entity_type2_id: "dog",
      event_type_id: "proximityID_123"
    },
    msgBody: { item_id: "Spot", name: "Spot", x_pos: 5, y_pos: 5 },
    areas: { office: { item_id: "office", coordinates } },
    entities: {
      Spot: {
        item_id: "Spot",
        name: "Spot",
        entity_type_id: "dog"
      },
      Tom: {
        item_id: "Tom",
        name: "Tom",
        x_pos: 5,
        y_pos: 5,
        entity_type_id: "person"
      },
      Jim: {
        item_id: "Jim",
        name: "Jim",
        x_pos: 5,
        y_pos: 12,
        entity_type_id: "person"
      }
    },
    events: {},
    eventTypes
  };
  // This is a fresh start and is not affected by tests above this point

  createOrEndEvent(argsMulti);

  expect(
    values(argsMulti.events),
    "creates multiple events if multiple broken"
  ).to.containSubset([
    {
      event_definition_id: "dogTooCloseToPerson",
      active: true,
      entity_id: "Tom",
      entity2_id: "Spot",
      area_id: undefined
    },
    {
      event_definition_id: "dogTooCloseToPerson",
      active: true,
      entity_id: "Jim",
      entity2_id: "Spot",
      area_id: undefined
    }
  ]);

  argsMulti.msgBody.y_pos = 0;

  createOrEndEvent(argsMulti);

  expect(
    values(argsMulti.events),
    "ends only the one that should be of multiple"
  ).to.containSubset([
    {
      event_definition_id: "dogTooCloseToPerson",
      active: true,
      entity_id: "Tom",
      entity2_id: "Spot",
      area_id: undefined
    },
    {
      event_definition_id: "dogTooCloseToPerson",
      active: false,
      entity_id: "Jim",
      entity2_id: "Spot",
      area_id: undefined
    }
  ]);




  // more relalistic
  // like a run with two entities moving around, and a area and proximity event_defs
  // 
  var proxEventDef = {
    item_id: "anyTooClose",
    threshold: 10,
    is_inside: true,
    event_type_id: "proximityID_123"
  }
  var areaEventDef = {
    item_id: "insideAny",
    is_inside: true,
    event_type_id: "areaID_123"
  }
  var args = {
    eventDef: areaEventDef,
    msgBody: { item_id: "Tom", name: "Tom", x_pos: 5, y_pos: 5 },
    areas: { office: { item_id: "office", coordinates } },
    entities: {
      Spot: {
        item_id: "Spot",
        name: "Spot",
        x_pos: 5,
        y_pos: 5,
        entity_type_id: "myEntityType"
      },
      Tom: { item_id: "Tom", name: "Tom", x_pos: 5, y_pos: 5 }
    },
    events: {},
    eventTypes,
    eventActivity: {}
  };
  createOrEndEvent(args);

  args.msgBody = { item_id: "Tom", name: "Tom", x_pos: 7, y_pos: 7 }
  args.eventDef = areaEventDef
  createOrEndEvent(args);
  args.eventDef = proxEventDef
  createOrEndEvent(args);

  args.msgBody = { item_id: "Spot", name: "Spot", x_pos: 5, y_pos: 5 }
  args.eventDef = areaEventDef
  createOrEndEvent(args);
  args.eventDef = proxEventDef
  createOrEndEvent(args);

  args.msgBody = { item_id: "Tom", name: "Tom", x_pos: 6, y_pos: 6 }
  args.eventDef = areaEventDef
  createOrEndEvent(args);
  args.eventDef = proxEventDef
  createOrEndEvent(args);

  args.msgBody = { item_id: "Spot", name: "Spot", x_pos: 5, y_pos: 5 }
  args.eventDef = areaEventDef
  createOrEndEvent(args);
  args.eventDef = proxEventDef
  createOrEndEvent(args);


  args.msgBody = { item_id: "Spot", name: "Spot", x_pos: 125, y_pos: 25 }
  args.eventDef = areaEventDef
  createOrEndEvent(args);
  args.eventDef = proxEventDef
  createOrEndEvent(args);
  // log(JSON.stringify(args.events, null, 2))
  // log(JSON.stringify(args.eventActivity, null, 2))

  expect(
    values(args.events),
    "creates 3 events"
  ).to.containSubset([
    {
      event_definition_id: "insideAny",
      active: true,
      entity_id: "Tom",
      area_id: "office",
    },
    {
      event_definition_id: "insideAny",
      active: false,
      entity_id: "Spot",
      area_id: "office",
    },
    {
      event_definition_id: "anyTooClose",
      active: false,
      entity_id: "Tom",
      entity2_id: "Spot",
    },
  ]);


  resp.success("All tests passed");
}

function values(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}