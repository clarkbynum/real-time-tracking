
function test_isProximityEvent(req, resp) {
  var allPassed = true;
  function expect(val1, val2, msg) {
    if (val1 === val2) {
      log("PASSED: " + msg);
    } else {
      log("FAILED: " + msg);
      allPassed = false;
      log(JSON.stringify(val1) + " " + JSON.stringify(val2));
      log("");
    }
  }

  var args = {
    eventDef: {
      entity_id: "Tom",
      entity2_id: "Spot",
      threshold: 5,
      is_inside: true
    },
    msgBody: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "person" },
    entities: {
      Spot: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
    }
  };

  expect(
    isProximityEvent(args)[0].isEvent,
    true,
    "same point triggers is_inside rule"
  );

  args.msgBody.x_pos = 11;
  expect(
    isProximityEvent(args)[0].isEvent,
    false,
    "barely outside point does not trigger is_inside rule"
  );

  args.msgBody.x_pos = 200;
  expect(
    isProximityEvent(args)[0].isEvent,
    false,
    "far off point does not trigger is_inside rule"
  );

  args.eventDef.is_inside = false;
  expect(
    isProximityEvent(args)[0].isEvent,
    true,
    "far off point triggers is outside rule"
  );

  args.eventDef.entity_id = "noMatch";
  expect(isProximityEvent(args).length, 0, "does not trigger for non matching entity");

  args.eventDef.entity_id = undefined;
  expect(
    isProximityEvent(args)[0].isEvent,
    true,
    "looks for all when nothing"
  );

  expect(
    isProximityEvent({
      eventDef: {
        entity_id: "Tom",
        entity_type2_id: "dog",
        threshold: 10,
        is_inside: true
      },
      msgBody: { item_id: "Tom", x_pos: 0, y_pos: 0 },
      entities: {
        Spot: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
      }
    })[0].isEvent,
    true,
    "uses entity_type2_id, Tom can't be close to any dog - Tom updated"
  );

  expect(
    isProximityEvent({
      eventDef: {
        entity_id: "Tom",
        entity_type2_id: "dog",
        threshold: 10,
        is_inside: true
      },
      msgBody: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" },
      entities: {
        Tom: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
      }
    })[0].isEvent,
    true,
    "uses entity_type2_id, Tom can't be close to any dog - Spot updated"
  );

  // Only the one that is msgBody should update
  var tomUpdatedResult = isProximityEvent({
    eventDef: {
      entity_id: "Tom",
      entity_type2_id: "dog",
      threshold: 10,
      is_inside: true
    },
    msgBody: { item_id: "Tom", x_pos: 0, y_pos: 0 },
    entities: {
      Spot: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
    }
  });

  expect(
    !!tomUpdatedResult[0].eventActivity.entity_data,
    true,
    "Tom updated, eventActivity for entity_data"
  );

  expect(
    !!tomUpdatedResult[0].eventActivity.entity2_data,
    false,
    "Tom updated, no eventActivity for entity2_data"
  );

  var spotUpdatedResult = isProximityEvent({
    eventDef: {
      entity_id: "Tom",
      entity_type2_id: "dog",
      threshold: 10,
      is_inside: true
    },
    msgBody: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" },
    entities: {
      Tom: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "person" }
    }
  });

  expect(
    !!spotUpdatedResult[0].eventActivity.entity_data,
    false,
    "Spot updated, no eventActivity for entity_data"
  );

  expect(
    !!spotUpdatedResult[0].eventActivity.entity2_data,
    true,
    "Spot updated, eventActivity for entity2_data"
  );

  expect(
    isProximityEvent({
      eventDef: {
        entity_type_id: "person",
        entity_type2_id: "dog",
        threshold: 10,
        is_inside: true
      },
      msgBody: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" },
      entities: {
        Tom: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "person" }
      }
    })[0].isEvent,
    true,
    "uses entity_type_id and entity_type2_id, people can't be close to any dogs"
  );

  var multipleEventsArg = {
    eventDef: {
      entity_id: "Tom",
      entity_type2_id: "dog",
      threshold: 10,
      is_inside: true
    },
    msgBody: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "person" },
    entities: {
      Spot: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" },
      Max: { item_id: "Max", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
    }
  };
  expect(
    isProximityEvent(multipleEventsArg).length,
    2,
    "multiple events to create"
  );

  multipleEventsArg.eventDef.entity_type2_id = undefined;
  expect(
    isProximityEvent(multipleEventsArg).length,
    2,
    "checks all when no entity specified"
  );

  multipleEventsArg.eventDef.entity_id = "sdf";
  expect(
    isProximityEvent(multipleEventsArg).length,
    0,
    "does not check all when other entity specified"
  );

  expect(
    isProximityEvent({
      eventDef: {
        entity_type_id: "cat",
        entity_type2_id: "dog",
        threshold: 10,
        is_inside: true
      },
      msgBody: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" },
      entities: {
        Tom: { item_id: "Tom", x_pos: 0, y_pos: 0, entity_type_id: "person" }
      }
    }).length,
    0,
    "when eventDef does not apply, returns nothing"
  );

  var sameTypeArgs = {
    eventDef: {
      entity_type_id: "dog",
      entity_type2_id: "dog",
      threshold: 10,
      is_inside: true
    },
    msgBody: { item_id: "Spot", x_pos: 1, y_pos: 1, entity_type_id: "dog" },
    entities: {
      Spot: { item_id: "Spot", x_pos: 0, y_pos: 0, entity_type_id: "dog" }
    }
  };
  expect(
    isProximityEvent(sameTypeArgs).length,
    0,
    "does not trigger on self"
  );

  sameTypeArgs.entities["Max"] = {
    item_id: "Max",
    x_pos: 0,
    y_pos: 0,
    entity_type_id: "dog"
  };
  expect(
    isProximityEvent(sameTypeArgs)[0].isEvent,
    true,
    "finds others of same type"
  );

  allPassed
    ? resp.success("All tests passed")
    : resp.error("Some tests failed");
}
