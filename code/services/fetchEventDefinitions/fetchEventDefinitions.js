/**
 * @typedef {object} event_definitions
 * @property {string} name
 * @property {string} description
 * @property {string} area_id
 * @property {string} entity_id
 * @property {string} entity2_id
 * @property {string} entity_type_id
 * @property {string} entity_type2_id
 * @property {boolean} is_inside
 * @property {number} threshold
 * @property {string} event_type_id
 * @property {string} updated_at
 * @property {string} together_word
 * @property {string} area_type_id
 */

 /**
 * @typedef {object} fetchEventDefinitionsParams
 * @property {string} cbQuery
 * @property {number} pageSize
 * @property {number} pageNum
 */

 /**
 * Fetches a list of items from the "event_definitions" collection
 * @param {{ params: fetchEventDefinitionsParams | event_definitions }} req
 * @param {fetchEventDefinitionsParams | event_definitions} req.params
 * @param {CbServer.Resp} resp
 */
function fetchEventDefinitions(req, resp) {
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
  var columnNames = ["name", "description", "area_id", "entity_id", "entity2_id", "entity_type_id", "entity_type2_id", "is_inside", "threshold", "event_type_id", "updated_at", "together_word", "area_type_id"]
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

  var col = ClearBlade.Collection({ collectionName: "event_definitions" });
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
