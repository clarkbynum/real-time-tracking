/**
 * @typedef {object} entities
 * @property {string} name
 * @property {string} entity_type_id
 * @property {number} x_pos
 * @property {number} y_pos
 */

 /**
 * @typedef {object} fetchEntitiesParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "entities" collection
 * @param {{ params: fetchEntitiesParams | entities }} req
 * @param {fetchEntitiesParams | entities} req.params
 * @param {CbServer.Resp} resp
 */
function fetchEntities(req, resp) {
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
    ["name", "entity_type_id", "x_pos", "y_pos"].forEach(function(name) {
      value = req.params[name];
      if(value !== undefined) {
        query.equalTo(name, value);
      }
    })
  }
  query.setPage(pageSize, pageNum);

  var col = ClearBlade.Collection({ collectionName: "entities" });
  col.fetch(query, function (err, data) {
    log(data)
    if (err) {
      resp.error(data)
    } else {
      resp.success(data);
    }
  });
}
