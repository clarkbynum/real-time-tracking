function processTagMessage(req, resp) {
  ClearBlade.init({ request: req })
  var msgBody = JSON.parse(req.params.body)

  return Q.all([
    cbFetchPromise({ collectionName: 'tags' }),
    cbFetchPromise({ collectionName: 'event_definitions' }),
    cbFetchPromise({ collectionName: 'entities' }),
    cbFetchPromise({ collectionName: "events", query: ClearBlade.Query().equalTo("active", true) }),
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

    var tag = resArr[0].DATA.filter(function (t) { return t.name === msgBody.name })[0]

    msgBody.item_id = tag.entity_id

    cbUpdatePromise({
      collectionName: 'entities',
      changes: { x_pos: msgBody.x_pos, y_pos: msgBody.y_pos },
      item_id: tag.entity_id
      // query: ClearBlade.Query().equalTo('item_id', tag.entity_id)
    })


    return Q.all(eventDefsArr.map(function (eventDef) {
      log('' + eventDef.name)
      log('asdf')

      return createOrEndEvent({ eventDef, msgBody, entities, areas, events, eventTypes })
    }))
  }).then(function (res) {
    resp.success('Successfully Processed');
  })
}

function find(obj, args) {
  return obj[args.value];
}

function values(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
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
