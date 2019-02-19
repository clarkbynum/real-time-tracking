/**
 * @typedef {object} areas
 * @property {string} name
*/

/**
 * @typedef {object} createAreasParams
 * @property {areas} item
 * @property {areas[]} items
*/

/**
 * Creates items in the "areas" collection
 * @param {{ params: createAreasParams }} req
 * @param {createAreasParams} req.params
 * @param {CbServer.Resp} resp
*/
function createAreas(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'areas' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
