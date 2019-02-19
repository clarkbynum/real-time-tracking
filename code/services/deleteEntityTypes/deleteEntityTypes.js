/**
 * @typedef {object} entity_types
 * @property {string} item_id
 * @property {string} name
 * @property {string} display_icon
*/

/**
 * @typedef {object} deleteEntityTypesParams
 * @property {string} item_id
 * @property {string[]} item_ids
 * @property {string} cbQuery
*/

/**
 * Deletes items from the "entity_types" collection
 * @param {{ params: deleteEntityTypesParams }} req
 * @param {deleteEntityTypesParams} req.params
 * @param {CbServer.Resp} resp
 */
function deleteEntityTypes(req, resp) {
  log(req)    
  if (!req.params.item_id && !req.params.item_ids && !req.params.cbQuery) {
    resp.error('invalid request, expected structure `{ item_id: "00000000-0000-0000-0000-000000000000" }` or `{ item_ids: ["00000000-0000-0000-0000-000000000000"] }`')
  }
  ClearBlade.init({ request: req });  

  var query = ClearBlade.Query();
  if (req.params.cbQuery) {
    // query delete
    query.query = req.params.cbQuery

  } else if (req.params.item_id) {
    // single delete    
    query.equalTo('item_id', req.params.item_id);

  } else if (req.params.item_ids) {
    // batch delete
    req.params.item_ids.forEach(function (item_id) {
      q = ClearBlade.Query().equalTo('item_id', item_id);
      query = query.or(q);
    });

  }
  
  var col = ClearBlade.Collection({ collectionName: 'entity_types' });
  col.remove(query, function(err, data) {
    log(data);
    if (err) {
      resp.error(data);
    } else {
      // note: it will return success even if element does not exist
      resp.success(data);
    }
  });
}
