/**
 * @typedef {object} events
 * @property {string} event_definition_id
 * @property {string} created_at
*/

/**
 * @typedef {object} fetchEventsParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
*/

/**
 * Fetches a list of items from the "events" collection
 * @param {{ params: fetchEventsParams | events }} req
 * @param {fetchEventsParams | events} req.params
 * @param {CbServer.Resp} resp
*/
function fetchEvents(req, resp) {
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

  var columnNames = ["event_definition_id", "created_at", "item_id"]
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
  query.ascending('created_at')

  var fetchedData;
  var count

  var col = ClearBlade.Collection({ collectionName: "events" });
  col.fetch(query, function (err, data) {
    fetchedData = data
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
