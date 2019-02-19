// so we can debug in a long running service
function log(str) {
  var msg = ClearBlade.Messaging();
  msg.publish("logOutputForProcessTagMessage", str);
}

var TOPIC = "+/tag/+";
var KILL_TOPIC_NAME = 'killProcessTagMessageLRS'

function processTagMessageLRS(req, resp) {

  ClearBlade.init({ request: req })
  log('-----RESTARTING----')

  return Q.all([
    cbFetchPromise({ collectionName: 'tags' }),
    cbFetchPromise({ collectionName: 'event_definitions' }),
    cbFetchPromise({ collectionName: 'entities' }),
    cbFetchPromise({ collectionName: "events" }),
    cbFetchPromise({ collectionName: 'areas' }),
    cbFetchPromise({ collectionName: 'event_definition_types' }),
  ]).then(function (resArr) {
    var tags = nestByItemId(resArr[0].DATA)
    var eventDefsArr = resArr[1].DATA
    var entities = nestByItemId(resArr[2].DATA)
    var events = nestByItemId(resArr[3].DATA, 'event_id')
    var areas = nestByItemId(resArr[4].DATA)
    var eventTypes = nestByItemId(resArr[5].DATA)

    var eventDefs = nestByItemId(eventDefsArr)
    // log(JSON.stringify({tags, eventDefsArr, entities, events, areas, eventTypes}, null, 2))

    var messaging = ClearBlade.Messaging();
    function handleNewMessage(err, msg, topic) {
      if (err) {
        resp.error(errMsg);
      }
      log("--------- got message " + msg)
      try {
        var msgBody = JSON.parse(msg)
      } catch (e) {
        resp.error('cant parse: ' + msg);
      }
      if (msgBody.name === KILL_TOPIC_NAME) {
        resp.success('this service was killed on purpose with the msgBody name: ' + KILL_TOPIC_NAME)
      }
      
      var tag = resArr[0].DATA.filter(function (t) { return t.name === msgBody.name })[0] || {}
      msgBody.item_id = tag.entity_id
      if (!tag.entity_id || !entities[tag.entity_id]) {
        log('ERROR: no entity associated with tag ' + msgBody.name)
        return
      }
      cbUpdatePromise({
        collectionName: 'entities',
        changes: { x_pos: msgBody.x_pos, y_pos: msgBody.y_pos },
        cache: entities,
        item_id: tag.entity_id
      })
      log('entity updated')

      eventDefsArr.map(function (eventDef) {
        log('checking event def: ' + eventDef.name + '   id: ' + eventDef.item_id)
        createOrEndEvent({ eventDef, msgBody, entities, areas, events, eventTypes })
      })
    }
    messaging.subscribe(TOPIC, function (err, errMsg) {
      if (err) {
        resp.error(errMsg);
      }
    });
    while (true) {
      messaging.waitForMessage(TOPIC, handleNewMessage);
    }
  })
}

function find(obj, args) {
  return obj[args.value];
}

function nestByItemId(arr, idKey) {
  if (!idKey) {
    idKey = 'item_id'
  }
  return arr.reduce(function (acc, item) {
    acc[item[idKey]] = item;
    return acc;
  }, {});
}