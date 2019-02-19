/**
 * @typedef IsProximityEvent
 * @property {boolean} isEvent
 * 
 */

/**
 * @typedef Entity
 * @property {string} item_id
 * @property {string} name
 * @property {number} x_pos
 * @property {number} y_pos
 * @property {string} entity_type_id
 * 
 */

/**
 * @typedef EventDefinition
 * @property {string} item_id
 * @property {number} threshold
 * @property {boolean} is_inside
 * @property {string} [event_type_id]
 * @property {string} [entity_id]
 * @property {string} [entity2_id]
 * @property {string} [entity_type_id]
 * @property {string} [entity_type2_id]
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
* @param {Object.<string, Entity>} entities
* @returns {IsProximityEvent[]}
* Library that creates or closes an event based on an event definition and an event
*/
function isProximityEvent(args) {
  var eventDef = args.eventDef;
  var msgBody = args.msgBody;
  var entitiesList = args.entities;

  // assign the msgBody to correct var
  if (eventDef.entity_id === msgBody.item_id) {
    var entity = msgBody;
  } else if (eventDef.entity2_id === msgBody.item_id) {
    var entity2 = msgBody;
  } else if (eventDef.entity_type_id === msgBody.entity_type_id) {
    var entity = msgBody;
  } else if (eventDef.entity_type2_id === msgBody.entity_type_id) {
    var entity2 = msgBody;
  } else if (!eventDef.entity_id && !eventDef.entity_type_id) {
    // all for entity
    var entity = msgBody;
  } else if (!eventDef.entity2_id && !eventDef.entity_type2_id) {
    // all for entity2
    var entity2 = msgBody;
  } else {
    log("\\\\\\\\neventDef does not apply " + eventDef.name);
    return []; // if this event_def does not apply
  }

  // msg body is set first and will always be one item, but if other is a type or all
  // could be compared to array of others
  var entities2;
  var entities;
  // ALL handling
  // if entity_2 set to all by both entity_type2_id and entity2_id empty
  if (entity && !eventDef.entity_type2_id && !eventDef.entity2_id) {
    entities2 = entitiesList;
  }
  if (entity2 && !eventDef.entity_type_id && !eventDef.entity_id) {
    entities = entitiesList;
  }

  // get the other full entities from the id
  if (!entity && eventDef.entity_id) {
    var entity = find(entitiesList, {
      key: "item_id",
      value: eventDef.entity_id
    });
  }
  if (!entity2 && eventDef.entity2_id) {
    var entity2 = find(entitiesList, {
      key: "item_id",
      value: eventDef.entity2_id
    });
  }
  if (!entity && eventDef.entity_type_id) {
    // entity_type_id may have already been used for msgBody
    entities = values(entitiesList).filter(function (ent) {
      return ent.entity_type_id === eventDef.entity_type_id;
    });
  }
  if (!entity2 && eventDef.entity_type2_id) {
    // entity_type2_id may have already been used for msgBody
    entities2 = values(entitiesList).filter(function (ent) {
      return ent.entity_type_id === eventDef.entity_type2_id;
    });
  }

  // simple comparison
  if (entity && entity2) {
    var isEvent = getIsEvent(entity, entity2, eventDef);

    return [getProximidyResults(entity, entity2, eventDef, msgBody)];
  }

  if (entities) {
    return values(entities)
      .map(function (ent) {
        return getProximidyResults(ent, entity2, eventDef, msgBody);
      })
      .filter(function (el) {
        return !!el;
      }); // remove nulls
  }

  if (entities2) {
    return values(entities2)
      .map(function (ent) {
        return getProximidyResults(entity, ent, eventDef, msgBody);
      })
      .filter(function (el) {
        return !!el;
      }); // remove nulls
  }

  log("shouldn't have gotten here");
  return [];
}

function getProximidyResults(entity, entity2, eventDef, msgBody) {
  if (entity.item_id === entity2.item_id) return; // don't allow "dog too close to dog" to trigger on self - "spot too close to spot"
  var isEvent = getIsEvent(entity, entity2, eventDef);

  var eventName = makeName({ eventDef, entity, entity2 });
  var result = {
    entity_id: entity.item_id,
    entity2_id: entity2.item_id,
    isEvent,
    eventName
  };
  if (isEvent) {
    if (msgBody.item_id === entity.item_id) {
      result.eventActivity = {
        entity_data: JSON.stringify(entity),
        timestamp: msgBody.timestamp
      };
    } else {
      result.eventActivity = {
        entity2_data: JSON.stringify(entity2),
        timestamp: msgBody.timestamp
      };
    }
  }
  return result;
}

function find(obj, args) {
  return obj[args.value];
}

function values(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

function getDistanceBetween(entity, entity2, threshold, threshold2) {
  return Math.hypot(entity.x_pos - entity2.x_pos, entity.y_pos - entity2.y_pos);
}

function getIsEvent(entity, entity2, eventDef) {
  var distBetween = getDistanceBetween(entity, entity2);
  var actuallyIsInside = eventDef.threshold > distBetween;
  return actuallyIsInside == eventDef.is_inside;
  // log({ actuallyIsInside, shouldBe: eventDef.is_inside, distBetween, entity, entity2 })
}