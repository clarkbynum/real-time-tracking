/**
 * @typedef {object} user
 * @property {string} [password]
 * @property {boolean} [first_name]
 * @property {string} [last_name]
*/

/**
 * @typedef {object} updateUsersParams
 * @property {users} user
 * @property {string} email
 */

/**
 * Updates a user in the Users table
 * @param {{ params: updateUsersParams }} req
 * @param {updateUsersParams} req.params
 * @param {CbServer.Resp} resp
 * @returns {string} Error
 */

function updateUsers(req, resp) {
  ClearBlade.init({ request: req });

  var query = ClearBlade.Query();
  query.equalTo("email", req.params.email);
  
  var user = ClearBlade.User();
  user.setUsers(query, req.params.user, function (err, data) {
    if (err) {
      resp.error(JSON.stringify(data));
    } else {
      resp.success("Successfully updated employee");
    }
  });
}

