/**
 * @typedef {object} tags
 * @property {string} name
 * @property {string} tag_type_id
 * @property {string} entity_id
*/

/**
 * @typedef {object} createTagsParams
 * @property {tags} item
 * @property {tags[]} items
*/

/**
 * Creates items in the "tags" collection
 * @param {{ params: createTagsParams }} req
 * @param {createTagsParams} req.params
 * @param {CbServer.Resp} resp
*/
function createTags(req, resp) {
  log(req) 
  if (!req.params.item && !req.params.items) {
    resp.error('invalid request, expected structure `{ item: { myProp: "", myProp2: "" } }`}')  
  }
  ClearBlade.init({ request: req }); 

  if (req.params.item) {
    req.params.items = [req.params.item];
  }
  var col = ClearBlade.Collection({ collectionName: 'tags' });
  col.create(req.params.items, function(err, data) {
    log(data) 
    if (err) {
      resp.error(data);
    } else {
      resp.success(data);
    }
  });
}
