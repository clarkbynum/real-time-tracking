/**
 * @typedef {object} events
 * @property {string} item_id
 * @property {string} event_definition_id
 * @property {string} created_at
*/

/**
 * @typedef {object} updateEventsParams
 * @property {events} item
 */

/**
 * Updates an item from the "events" collection
 * @param {{ params: updateEventsParams }} req
 * @param {updateEventsParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateEvents(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `')
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "events" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
