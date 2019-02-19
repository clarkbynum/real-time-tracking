/**
 * @typedef {object} tags
 * @property {string} name
 * @property {string} tag_type_id
 * @property {string} entity_id
 */

 /**
 * @typedef {object} fetchTagsParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "tags" collection
 * @param {{ params: fetchTagsParams | tags }} req
 * @param {fetchTagsParams | tags} req.params
 * @param {CbServer.Resp} resp
 */
function fetchTags(req, resp) {
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
    ["name", "tag_type_id", "entity_id"].forEach(function(name) {
      value = req.params[name];
      if(value !== undefined) {
        query.equalTo(name, value);
      }
    })
  }
  query.setPage(pageSize, pageNum);

  var col = ClearBlade.Collection({ collectionName: "tags" });
  col.fetch(query, function (err, data) {
    log(data)
    if (err) {
      resp.error(data)
    } else {
      resp.success(data);
    }
  });
}
