/**
 * @typedef EventDefinition
 * @property {string} item_id
 * @property {number} threshold
 * @property {boolean} is_inside
 * @property {string} event_type_id
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
 * @typedef Coordinate
 * @property {number} x
 * @property {number} y
 * 
 */

/**
 * @typedef Area
 * @property {string} item_id
 * @property {Coordinate[]} coordinates
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
 * @typedef EventType
 * @property {string} item_id
 * @property {string} name
 * 
 */

/**
* @param {EventDefinition} eventDef
* @param {MessageBody} msgBody
* @param {Object.<string, Area>} areas
* @param {Object.<string, Entity>} entities
* @param {Object.<string, EventType>} eventTypes
* @returns {Promise}
* Library that creates or closes an event based on an event definition and an event
*/
function createOrEndEvent(args) {
  if (args.msgBody.x_pos === null || args.msgBody.x_pos === undefined) {
    return
  }
  var eventDef = args.eventDef;
  var events = args.events;
  var msg = ClearBlade.Messaging();
  log('createOrEndEvent')

  log('going to check: ' + args.eventDef.name  );
  const eventResults = shouldCreateOrEndEvent(args);
  log('did check: ' + args.eventDef.name + ' -  ' + JSON.stringify(eventResults));
  log('did that')
  return eventResults.map(function (eventResult) {
    log('in loopp')
    if (eventResult.newEvent) {
      // CREATE EVENT
      log("CREATING EVENT " + eventResult.newEvent.name);
      msg.publish("eventTriggered", "New Event:" + eventDef.name);

      // have to use custom id so we don't have to wait for backend, now it is immediately added to the in memory cache
      // so we don't get duplicate events for same broken rule updated milliseconds apart
      var event_id = getRandomId();
      eventResult.newEvent.event_id = event_id;
      eventResult.eventActivity.event_id = event_id;

      events[event_id] = eventResult.newEvent;
      cbCreatePromise({
        collectionName: "events",
        item: eventResult.newEvent
      });
      cbCreatePromise({
        collectionName: "event_activity",
        item: eventResult.eventActivity,
        cache: args.eventActivity
      });
    } else if (eventResult.eventIdToEnd) {
      // END EVENT
      // important that event_activity doesn't try to get created without event_id if newEvent
      var ended_at = args.msgBody.timestamp
      var event = events[eventResult.eventIdToEnd];
      log("ENDING EVENT " + event.name + ", id:" + eventResult.eventIdToEnd);
      event.ended_at = ended_at;
      event.active = false;
      msg.publish("eventTriggered", "Ended Event" + eventDef.name);

      return cbUpdatePromise({
        collectionName: "events",
        changes: { ended_at, active: false },
        query: ClearBlade.Query().equalTo("event_id", eventResult.eventIdToEnd)
      });
    } else if (eventResult.eventActivity) {
      // LOG EVENT ACTIVITY
      return cbCreatePromise({
        collectionName: "event_activity",
        item: eventResult.eventActivity,
        cache: args.eventActivity // just to make test easier doesn't actully get provided in real func
        // cause we don't need to check it to do anything
      });
    }
  });
}

function shouldCreateOrEndEvent(args) {
  // fill out the other properties like name and type
  var msgEnt = find(args.entities, {
    key: "item_id",
    value: args.msgBody.item_id
  });
  if (msgEnt) {
    args.msgBody.name = msgEnt.name;
  }

  args.msgBody = msgEnt
    ? Object.assign({}, msgEnt, args.msgBody)
    : args.msgBody; // mostly just to keep tests simplier

  var eventType = args.eventTypes[args.eventDef.event_type_id];
  if (eventType.enabled === false) {
    log(
      'the event type: "' +
      eventType.name +
      '" has been disabled from the event_definition_types table'
    );
    return [];
  }
  if (eventType.name === "area") {
    var testEventResults = isAreaEvent(args);
  } else {
    var testEventResults = isProximityEvent(args);
  }

  return testEventResults.map(function (testEventResult) {
    var isEvent = testEventResult.isEvent;

    var newEvent = {
      event_definition_id: args.eventDef.item_id,
      name: testEventResult.eventName,
      created_at: args.msgBody.timestamp,
      active: true,
      entity_id: testEventResult.entity_id,
      entity2_id: testEventResult.entity2_id,
      area_id: testEventResult.area_id
    };

    var activeEvent = findExistingEvent(args.events, newEvent);

    if (activeEvent) {
      // fix for "any close to any", storing alternate entities as entity_data
      if (
        activeEvent.entity2_id === args.msgBody.item_id &&
        testEventResult.eventActivity &&
        testEventResult.eventActivity.entity_data
      ) {
        testEventResult.eventActivity.entity2_data =
          testEventResult.eventActivity.entity_data;
        delete testEventResult.eventActivity.entity_data;
      }
    }
    log({ isEvent, activeEvent: !!activeEvent, eventDefName: args.eventDef.name  });
    if (testEventResult.eventActivity && activeEvent) {
      testEventResult.eventActivity.event_id = activeEvent.event_id;
    }

    // conditions in event def were met, and there is no active event, so create one
    if (isEvent && !activeEvent) {
      testEventResult.newEvent = newEvent;
      // log({ newEvent: true, name: newEvent.name, eventDefName: args.eventDef.name })
    }

    // conditions in event def were not met, but there is an active event, so end it
    if (!isEvent && activeEvent) {
      testEventResult.eventIdToEnd = activeEvent.event_id;
    }

    return testEventResult;
  });
}

function findExistingEvent(events, newEvent) {
  return values(events).filter(function (event) {
    if (!event.active) return false;
    if (event.event_definition_id !== newEvent.event_definition_id) return false

    if (
      event.area_id == newEvent.area_id // unused if prox but will match with empty
      && event.entity_id == newEvent.entity_id 
      && event.entity2_id == newEvent.entity2_id // unused if area but will match with empty
    ) {
      // if all fields match the event is the same
      return true
    }

    if (event.entity2_id == newEvent.entity_id && event.entity_id == newEvent.entity2_id) {
      // should also match switched entites for broad event defs
      // if 'any close to any' is rule, don't want both 'Tom too close to Jim' and 'Jim too close to Tom'
      
      // this won't be triggered for area events since entity2_id will always be empty and entity_id never empty
      return true
    }
  })[0];
}

function find(obj, args) {
  return obj[args.value];
}

function values(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

function getRandomId() {
  return (
    "" +
    Math.random()
      .toString(36)
      .substr(2, 15)
  );
}