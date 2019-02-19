/**
 * @typedef {object} anchors
 * @property {string} item_id
 * @property {string} name
 * @property {number} x_pos
 * @property {number} y_pos
 * @property {string} view_id
*/

/**
 * @typedef {object} updateAnchorsParams
 * @property {anchors} item
 */

/**
 * Updates an item from the "anchors" collection
 * @param {{ params: updateAnchorsParams }} req
 * @param {updateAnchorsParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateAnchors(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `')
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "anchors" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
