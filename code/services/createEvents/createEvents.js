/**
 * @typedef {object} events
 * @property {string} event_definition_id
 * @property {string} created_at
 * @property {boolean} active
*/

/**
 * @typedef {object} createEventsParams
 * @property {events} item
 * @property {events[]} items
*/

/**
 * Creates items in the "events" collection
 * @param {{ params: createEventsParams }} req
 * @param {createEventsParams} req.params
 * @param {CbServer.Resp} resp
*/
function createEvents(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }

  var col = ClearBlade.Collection({ collectionName: 'events' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
