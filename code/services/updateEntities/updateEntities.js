/**
 * @typedef {object} entities
 * @property {string} item_id
 * @property {string} name
 * @property {string} entity_type_id
 * @property {number} x_pos
 * @property {number} y_pos
*/

/**
 * @typedef {object} updateEntitiesParams
 * @property {entities} item
 */

/**
 * Updates an item from the "entities" collection
 * @param {{ params: updateEntitiesParams }} req
 * @param {updateEntitiesParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateEntities(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `')
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "entities" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
