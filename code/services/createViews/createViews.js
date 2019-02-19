/**
 * @typedef {object} views
 * @property {string} name
 * @property {string} icon
 * @property {number} width
 * @property {number} height
*/

/**
 * @typedef {object} createViewsParams
 * @property {views} item
 * @property {views[]} items
*/

/**
 * Creates items in the "views" collection
 * @param {{ params: createViewsParams }} req
 * @param {createViewsParams} req.params
 * @param {CbServer.Resp} resp
*/
function createViews(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'views' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
