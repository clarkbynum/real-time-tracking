/**
 * @typedef IsAreaEvent
 * @property {boolean} isEvent
 * 
 */

/**
 * @typedef Area
 * @property {string} item_id
 * @property {Coordinate[]} coordinates
 * 
 */

/**
 * @typedef EventDefinition
 * @property {string} item_id
 * @property {number} threshold
 * @property {boolean} is_inside
 * @property {string} [entity_id]
 * @property {string} [area_id]
 * 
 */

/**
 * @typedef MessageBody
 * @property {string} item_id
 * @property {string} name
 * @property {number} x_pos
 * @property {number} y_pos
 * 
 */

/**
* @param {EventDefinition} eventDef
* @param {MessageBody} msgBody
* @param {Object.<string, Area>} areas
* @returns {IsAreaEvent[]}
*/
function isAreaEvent(args) {
  var eventDef = args.eventDef;
  var msgBody = args.msgBody;
  var entities = args.entities;
  var areas = args.areas;

  var allEvent = !eventDef.entity_id && !eventDef.entity_type_id;
  if (
    eventDef.entity_id != msgBody.item_id &&
    eventDef.entity_type_id != msgBody.entity_type_id &&
    !allEvent
  ) {
    return [];
  }
  
  var myAreas = {};
  if(eventDef.area_id) {
    var area = find(areas, { key: "item_id", value: eventDef.area_id });
    if (!area) return [];
    myAreas[area.item_id] = area;
  } else if (eventDef.area_type_id) {
    myAreas = values(areas).filter(function (a) {
      return a.area_type_id === eventDef.area_type_id;
    });
    log(JSON.stringify({myAreas}))
  } else {
    // nothing specified means all
    myAreas = areas;
  }


  return values(myAreas).map(function(area) {
    var actuallyIsInside = isPointInPolygon(msgBody, JSON.parse(area.coordinates));
    const isEvent = eventDef.is_inside === actuallyIsInside;
    log({isEvent, actuallyIsInside, area})
    
    return {
      isEvent,
      entity_id: msgBody.item_id,
      area_id: area.item_id,
      eventActivity: {
        entity_data: JSON.stringify(msgBody),
        area_data: JSON.stringify(area),
        timestamp: new Date().toISOString()
      },
      eventName: makeName({ eventDef, area, entity: msgBody })
    };
  });
}

function find(obj, args) {
  return obj[args.value];
}
function values(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
}