function test_shouldCreateOrEndEvent(req, resp) {
  var allPassed = true;
  function expect(val1, val2, msg) {
    if (val1 === val2) {
      log("PASSED: " + msg);
    } else {
      log("FAILED: " + msg);
      log(JSON.stringify(val1) + " " + val2);
      allPassed = false;
    }
    log("");
  }

  var events = {
    eventId: {
      event_definition_id: "eventDefId",
      event_id: "eventId",
      entity_id: "Tom",
      entity2_id: "Spot",
      active: true
    }
  };
  var eventTypes = {
    areaID_123: { item_id: "areaID_123", name: "area" },
    proximityID_123: { item_id: "proximityID_123", name: "proximity" }
  };

  var proxEventArgs = {
    eventDef: {
      item_id: "eventDefId",
      entity_id: "Tom",
      entity2_id: "Spot",
      threshold: 10,
      is_inside: true,
      event_type_id: "proximityID_123"
    },
    msgBody: { item_id: "Tom", name: "Tom", x_pos: 1, y_pos: 1 },
    entities: {
      Spot: {
        item_id: "Spot",
        name: "Spot",
        x_pos: 1,
        y_pos: 1,
        entity_type_id: "myEntityType"
      }
    },
    events: {},
    eventTypes
  };

  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].newEvent,
    true,
    "proximity - creates when event def met"
  );

  proxEventArgs.events = events;
  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].newEvent,
    false,
    "proximity - doesn't create when there already is an active event"
  );

  proxEventArgs.eventDef.is_inside = false;
  expect(
    shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].eventIdToEnd,
    "eventId",
    "proximity - ends event if no longer meeting event def event"
  );

  proxEventArgs.events.eventId.active = false;
  expect(
    shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].event_activity,
    undefined,
    "proximity - does nothing if inactive result"
  );

  proxEventArgs.events = {};
  expect(
    shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].event_activity,
    undefined,
    "proximity - does nothing if not meeting event def and no active events"
  );

  proxEventArgs.eventDef = {
    item_id: "anyToAnyProx",
    threshold: 10,
    is_inside: true,
    event_type_id: "proximityID_123"
  };

  proxEventArgs.events = {
    eventAllId: {
      event_id: "eventAllId",
      event_definition_id: "anyToAnyProx",
      entity_id: "Spot",
      entity2_id: "Tom",
      active: true
    }
  };

  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, proxEventArgs))[0].eventActivity
      .entity2_data,
    true,
    "proximity - add entity2_data"
  );

  var tenSquare = JSON.stringify([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ]);

  var areaEventArgs = {
    eventDef: {
      item_id: "eventDefId",
      event_type_id: "areaID_123",
      entity_id: "Tom",
      area_id: "myArea",
      is_inside: true,
      threshold: 0
    },
    msgBody: { item_id: "Tom", x_pos: 5, y_pos: 5 },
    areas: {
      myArea: {
        item_id: "myArea",
        coordinates: tenSquare
      }
    },
    entities: {},
    events: {
      eventDefId: {
        event_definition_id: "eventDefId",
        entity_id: "Tom",
        area_id: "myArea",
        active: true,
        event_id: "myEvent"
      }
    },
    eventTypes
  };

  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, areaEventArgs))[0].newEvent,
    false,
    "area - doesn't create when there already is an event"
  );

  areaEventArgs.events = {};
  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, areaEventArgs))[0].newEvent,
    true,
    "area - creates when there isnt already one"
  );

  areaEventArgs.eventDef.is_inside = false;
  expect(
    !!shouldCreateOrEndEvent(Object.assign({}, areaEventArgs))[0].newEvent,
    false,
    "area - doesnt create if not meeting event def"
  );

  var areaEventArgsWType = {
    eventDef: {
      item_id: "eventDefId",
      event_type_id: "areaID_123",
      entity_type_id: "myType",
      area_id: "myArea",
      is_inside: true,
      threshold: 0
    },
    msgBody: { item_id: "Tom", x_pos: 5, y_pos: 5, entity_type_id: "myType" },
    areas: {
      myArea: {
        item_id: "myArea",
        coordinates: tenSquare
      }
    },
    entities: {},
    events: {},
    eventTypes
  };

  expect(
    !!shouldCreateOrEndEvent(areaEventArgsWType)[0].newEvent,
    true,
    "area - uses entity_type_id and triggers event"
  );

  areaEventArgsWType.eventDef.entity_type_id = "noMatch";
  expect(
    shouldCreateOrEndEvent(areaEventArgsWType).length,
    0,
    "area - uses entity_type_id and doesn't trigger if entity_type_id or msgBody doesn't match"
  );

  allPassed
    ? resp.success("All tests passed")
    : resp.error("Some tests failed");
}