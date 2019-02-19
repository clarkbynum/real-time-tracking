/**
 * @typedef {object} tag_types
 * @property {string} name
*/

/**
 * @typedef {object} createTagTypesParams
 * @property {tag_types} item
 * @property {tag_types[]} items
*/

/**
 * Creates items in the "tag_types" collection
 * @param {{ params: createTagTypesParams }} req
 * @param {createTagTypesParams} req.params
 * @param {CbServer.Resp} resp
*/
function createTagTypes(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'tag_types' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
