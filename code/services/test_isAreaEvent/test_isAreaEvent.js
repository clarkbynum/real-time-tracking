// function log(str) {
//   var msg = ClearBlade.Messaging();
//   msg.publish("logOutput", str);
// }

function test_isAreaEvent(req, resp) {
  ClearBlade.init({ request: req})
  var expect = chai.expect;

  var coordinates = JSON.stringify([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 }
  ]);

  var coordinates2 = JSON.stringify([
    { x: 20, y: 20 },
    { x: 30, y:20 },
    { x: 30, y: 30 },
    { x: 20, y: 30 }
  ]);

  var args = {
    eventDef: {
      entity_id: "Tom",
      area_id: "office",
      is_inside: true
    },
    msgBody: { item_id: "Tom", x_pos: 5, y_pos: 5 },
    areas: { office: { item_id: "office", coordinates } }
  };
  log(JSON.stringify(isAreaEvent(args)))

  expect(isAreaEvent(args)[0].isEvent, "finds point inside").to.equal(true);

  args.eventDef.is_inside = false
  args.msgBody.y_pos = 50;
  expect(
    isAreaEvent(args)[0].isEvent,
    "meets is outside if far outside "
  ).to.equal(true);

  var allEntitiesArgs = {
    eventDef: { area_id: "office", is_inside: true },
    msgBody: { item_id: "Tom", x_pos: 5, y_pos: 5, entity_type_id: "person" },
    areas: { office: { item_id: "office", coordinates, area_type_id: 'officeType', other: { item: 'other', coordinates: coordinates2} } },
    areaTypes: { officeType: {item_id: 'officeType' }}
  };
  expect(isAreaEvent(allEntitiesArgs)[0].isEvent, "all works --").to.equal(
    true
  );

  allEntitiesArgs.eventDef.entity_id = "noMatch";
  expect(
    isAreaEvent(allEntitiesArgs).length,
    "still checks entity_id if present "
  ).to.equal(0);

  allEntitiesArgs.eventDef.entity_id = undefined;
  allEntitiesArgs.eventDef.area_id = undefined;
  expect(
    isAreaEvent(allEntitiesArgs)[0].isEvent,
    "finds with any area "
  ).to.equal(true);

  allEntitiesArgs.eventDef.area_id = "noMatch";
  expect(
    isAreaEvent(allEntitiesArgs).length,
    "does not search all when given area "
  ).to.equal(0);

  allEntitiesArgs.eventDef.area_type_id = "officeType";
  allEntitiesArgs.eventDef.area_id = undefined;
  expect(
    isAreaEvent(allEntitiesArgs)[0].isEvent,
    "matches based on type "
  ).to.equal(true);


  allEntitiesArgs.msgBody.x_pos = 25
  allEntitiesArgs.msgBody.y_pos = 25
  expect(
    isAreaEvent(allEntitiesArgs)[0].isEvent,
    // should this be length 0 instead?
    "doesnt give false positive based on type "
  ).to.equal(false);

  resp.success("All tests passed");
}