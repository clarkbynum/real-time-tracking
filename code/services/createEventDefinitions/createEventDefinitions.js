/**
 * @typedef {object} event_definitions
 * @property {string} name
 * @property {string} description
 * @property {string} area_id
 * @property {string} entity_id
 * @property {string} entity2_id
 * @property {string} entity_type_id
 * @property {string} entity_type2_id
 * @property {boolean} is_inside
 * @property {number} threshold
 * @property {string} event_type_id
 * @property {string} updated_at
 * @property {string} together_word
 * @property {string} area_type_id
*/

/**
 * @typedef {object} createEventDefinitionsParams
 * @property {event_definitions} item
 * @property {event_definitions[]} items
*/

/**
 * Creates items in the "event_definitions" collection
 * @param {{ params: createEventDefinitionsParams }} req
 * @param {createEventDefinitionsParams} req.params
 * @param {CbServer.Resp} resp
*/
function createEventDefinitions(req, resp) {
  log(req) 
  if (!(req.params.item && !Array.isArray(req.params.item)) && !(req.params.items && Array.isArray(req.params.items))) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }` or `{ items: []}`. Received: ' + JSON.stringify(req.params, null, 2))
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'event_definitions' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
