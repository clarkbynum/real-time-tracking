/**
 * @typedef {object} entity_types
 * @property {string} name
 * @property {string} display_icon
 */

 /**
 * @typedef {object} fetchEntityTypesParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "entity_types" collection
 * @param {{ params: fetchEntityTypesParams | entity_types }} req
 * @param {fetchEntityTypesParams | entity_types} req.params
 * @param {CbServer.Resp} resp
 */
function fetchEntityTypes(req, resp) {
  log(req)  
  ClearBlade.init({ request: req });

  var cbQuery = req.params.cbQuery
  var pageSize = req.params.pageSize || 0
  var pageNum = req.params.pageNum || 0
  delete req.params.cbQuery
  delete req.params.pageSize
  delete req.params.pageNum

  var query = ClearBlade.Query();
  // allows for complex queries generated from the filter widget
  if (cbQuery) {
    query.query = cbQuery
  } else {
    // allows basic filtering on any column
    ["name", "display_icon"].forEach(function(name) {
      value = req.params[name];
      if(value !== undefined) {
        query.equalTo(name, value);
      }
    })
  }
  query.setPage(pageSize, pageNum);

  var col = ClearBlade.Collection({ collectionName: "entity_types" });
  col.fetch(query, function (err, data) {
    log(data)
    if (err) {
      resp.error(data)
    } else {
      resp.success(data);
    }
  });
}
