/**
 * @typedef {object} area_types
 * @property {string} item_id
 * @property {string} name
 * @property {string} display_icon
*/

/**
 * @typedef {object} updateAreaTypesParams
 * @property {area_types} item
 */

/**
 * Updates an item from the "area_types" collection
 * @param {{ params: updateAreaTypesParams }} req
 * @param {updateAreaTypesParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateAreaTypes(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `. Received: ' + JSON.stringify(req.params, null, 2))
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "area_types" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
