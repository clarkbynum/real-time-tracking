/**
 * @typedef Item
 * @property {string} [item_id]
 * 
 */

/**
* @param {{}} changes
* @param {string} [item_id]
* @param {string} collectionName
* @param {Object.<string, Item>} [cache]
* @param {{}} [query]
* @returns {Promise}
*/
function cbUpdatePromise(opts) {
    var deferred = Q.defer();
    var col = ClearBlade.Collection({ collectionName: opts.collectionName })
    if (opts.cache && opts.item_id) {
        Object.keys(opts.changes).forEach(function (k) {
            if(!opts.cache[opts.item_id]) {
                log('ERROR: trying to update an item that does not exist ' + JSON.stringify(opts))
            }
            opts.cache[opts.item_id][k] = opts.changes[k]
        })
    }
    if (opts.item_id) {
        var query = ClearBlade.Query().equalTo('item_id', opts.item_id)
    }
    col.update(opts.query || query, opts.changes, function (err, res) {
        if (err) {
            log('Error with update ' + JSON.stringify(opts))
            deferred.reject(res);
        } else {
            // log('updated ' + opts.collectionName)
            deferred.resolve(res);
        }
    })

    return deferred.promise;
}