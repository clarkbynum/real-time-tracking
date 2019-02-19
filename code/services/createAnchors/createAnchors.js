/**
 * @typedef {object} anchors
 * @property {string} name
 * @property {number} x_pos
 * @property {number} y_pos
 * @property {string} view_id
*/

/**
 * @typedef {object} createAnchorsParams
 * @property {anchors} item
 * @property {anchors[]} items
*/

/**
 * Creates items in the "anchors" collection
 * @param {{ params: createAnchorsParams }} req
 * @param {createAnchorsParams} req.params
 * @param {CbServer.Resp} resp
*/
function createAnchors(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'anchors' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
