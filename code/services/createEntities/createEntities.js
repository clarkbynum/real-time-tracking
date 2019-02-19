/**
 * @typedef {object} entities
 * @property {string} name
 * @property {string} entity_type_id
 * @property {number} x_pos
 * @property {number} y_pos
*/

/**
 * @typedef {object} createEntitiesParams
 * @property {entities} item
 * @property {entities[]} items
*/

/**
 * Creates items in the "entities" collection
 * @param {{ params: createEntitiesParams }} req
 * @param {createEntitiesParams} req.params
 * @param {CbServer.Resp} resp
*/
function createEntities(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'entities' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
