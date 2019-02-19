/**
 * @typedef {object} entity_types
 * @property {string} name
 * @property {string} display_icon
*/

/**
 * @typedef {object} createEntityTypesParams
 * @property {entity_types} item
 * @property {entity_types[]} items
*/

/**
 * Creates items in the "entity_types" collection
 * @param {{ params: createEntityTypesParams }} req
 * @param {createEntityTypesParams} req.params
 * @param {CbServer.Resp} resp
*/
function createEntityTypes(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'entity_types' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
