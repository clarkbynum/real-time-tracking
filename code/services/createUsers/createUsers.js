/**
 * @typedef NewUser
 * @property {string} email Email address of new user
 * @property {string} password Password for new user
 * @property {string} first_name
 * @property {string} last_name
 */

/**
 * @typedef {object} createUsersParams
 * @property {NewUser} item
 * @property {NewUser[]} items
*/

/**
 * Creates users in the Users table
 * @param {{ params: createUsersParams }} req
 * @param {createUsersParams} req.params
 * @param {CbServer.Resp} resp
 * @returns {string} Error
 * @returns {CreateEmployeeResponse} 
*/

/**
 * @typedef CreateEmployeeResponse
 * @property {string} email
 * @property {string} password
 */

function createUsers(req, resp) {
  ClearBlade.init({ request: req });

  if (req.params.item) {
    req.params.items = [req.params.item]
  }

  req.params.items.forEach(function (item) {
    if (!item.email) {
      resp.error("Email cannot be blank");
    }
    ClearBlade.init({
      systemKey: req.systemKey,
      systemSecret: req.systemSecret,
      registerUser: true,
      email: item.email,
      password: item.password,
      callback: function (err, body) {
        if (err) {
          resp.error(JSON.stringify(body));
        } else {
          ClearBlade.init({ request: req });
          var user = ClearBlade.User();
          var query = ClearBlade.Query();
          query.equalTo("email", item.email);
          const info = JSON.parse(JSON.stringify(item));
          delete info.email;
          delete info.password;
          user.setUsers(query, info, function (err, data) {
            if (err) {
              resp.error(JSON.stringify(data));
            } else {
              resp.success(data);
            }
          });
        }
      }
    });
  })
}
