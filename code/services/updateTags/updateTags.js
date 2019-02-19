/**
 * @typedef {object} tags
 * @property {string} item_id
 * @property {string} name
 * @property {string} tag_type_id
 * @property {string} entity_id
*/

/**
 * @typedef {object} updateTagsParams
 * @property {tags} item
 */

/**
 * Updates an item from the "tags" collection
 * @param {{ params: updateTagsParams }} req
 * @param {updateTagsParams} req.params
 * @param {CbServer.Resp} resp
 */
function updateTags(req, resp) {
  log(req)    
  if (!req.params.item || !req.params.item.item_id) {
    resp.error('invalid request, expected structure `{ item: { myPropToUpdate: "", item_id: "00000000-0000-0000-0000-000000000000" } } `')
  }
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();  
  query.equalTo('item_id', req.params.item.item_id);

  var col = ClearBlade.Collection({ collectionName: "tags" });
  col.update(query, req.params.item, function (err, data) {
    log(data)
    if (err) {
        resp.error(data)
    } else {
        resp.success(data);
    }
  });
}
