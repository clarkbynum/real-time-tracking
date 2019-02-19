/**
 * @typedef {object} event_activity
 * @property {string} event_id
 * @property {string} timestamp
 * @property {string} entity_data
 * @property {string} entity2_data
 * @property {string} area_data
 */

/**
* @typedef {object} fetchEventActivityParams
* @property {string} cbQuery
* @property {number} pageSize
* @property {number} pageNum
*/

/**
* Fetches a list of items from the "event_activity" collection
* @param {{ params: fetchEventActivityParams | event_activity }} req
* @param {fetchEventActivityParams | event_activity} req.params
* @param {CbServer.Resp} resp
*/
function fetchEventActivity(req, resp) {
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

  var columnNames = ["event_id", "timestamp", "entity_data", "entity2_data", "area_data"]
  // allows basic filtering on any column
  columnNames.forEach(function (name) {
    value = req.params[name];
    if (value !== undefined) {
      query = query.equalTo(name, value);
    }
  })
  if (req.params.pageSize && req.params.pageNum !== undefined) {
    query.setPage(pageSize, pageNum);
  }
  query.ascending('timestamp')

  var fetchedData;
  var count

  var col = ClearBlade.Collection({ collectionName: "event_activity" });
  col.fetch(query, function (err, data) {
    fetchedData = data
    log(data)
    if (err) {
      resp.error(data)
    } else {
      // TOTAL from fetch is just DATA.length, replace it with total that match query
      if (fetchedData && count !== undefined) {
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
      if (fetchedData && count !== undefined) {
        fetchedData.TOTAL = count
        resp.success(fetchedData)
      }
    }
  })
}
