/**
 * @typedef {object} area_types
 * @property {string} name
 * @property {string} display_icon
*/

/**
 * @typedef {object} createAreaTypesParams
 * @property {area_types} item
 * @property {area_types[]} items
*/

/**
 * Creates items in the "area_types" collection
 * @param {{ params: createAreaTypesParams }} req
 * @param {createAreaTypesParams} req.params
 * @param {CbServer.Resp} resp
*/
function createAreaTypes(req, resp) {
  log(req) 
  if (!(req.params.item && !Array.isArray(req.params.item)) && !(req.params.items && Array.isArray(req.params.items))) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }` or `{ items: []}`. Received: ' + JSON.stringify(req.params, null, 2))
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'area_types' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
