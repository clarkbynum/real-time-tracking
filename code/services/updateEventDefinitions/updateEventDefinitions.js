/**
 * @typedef {object} event_definitions
 * @property {string} item_id
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
 * @typedef {object} updateEventDefinitionsParams
 * @property {event_definitions} item
 */

/**
 * Updates an item from the "event_definitions" collection
 * @param {{ params: updateEventDefinitionsParams }} req
 * @param {updateEventDefinitionsParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateEventDefinitions(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `. Received: ' + JSON.stringify(req.params, null, 2))
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "event_definitions" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
