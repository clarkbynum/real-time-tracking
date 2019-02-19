/**
 * @typedef {object} area_types
 * @property {string} name
 * @property {string} display_icon
 */

 /**
 * @typedef {object} fetchAreaTypesParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "area_types" collection
 * @param {{ params: fetchAreaTypesParams | area_types }} req
 * @param {fetchAreaTypesParams | area_types} req.params
 * @param {CbServer.Resp} resp
 */
function fetchAreaTypes(req, resp) {
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
  }
  // allows basic filtering on any column
  var columnNames = ["name", "display_icon"]
  columnNames.forEach(function(name) {
    value = req.params[name];
    if(value !== undefined) {
      query.equalTo(name, value);
    }
  })
  if (req.params.pageSize && req.params.pageNum !== undefined) {
    query.setPage(pageSize, pageNum);
  }

  var fetchedData;
  var count

  var col = ClearBlade.Collection({ collectionName: "area_types" });
  col.fetch(query, function (err, data) {
    fetchedData = data
    log(data)
    if (err) {
      resp.error(data)
    } else {
      // TOTAL from fetch is just DATA.length, replace it with total that match query
      if(fetchedData && count !== undefined) {
        fetchedData.TOTAL = count
        resp.success(data)
      }
    }
  });

  col.count(query, function (err, data) {
    count = data.count
    if (err) {
      resp.error(data)
    } else {
      if(fetchedData && count !== undefined) {
        fetchedData.TOTAL = count
        resp.success(fetchedData)
      }
    }
  })
}
