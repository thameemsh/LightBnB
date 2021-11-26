const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  let queryString = `SELECT * FROM users
  WHERE email = $1`;
  let values = [email];
  return pool
  .query(queryString,values)
  .then(result => {
    console.log(result.rows[0])
    return result.rows[0]})
  .catch(err => console.log(err.message))

}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  let queryString = `SELECT * FROM users
  WHERE id = $1`;
  let values = [id];
  return pool
  .query(queryString,values)
  .then(result => result.rows[0])
  .catch(err => console.log(err.message))


  // return Promise.resolve(users[id]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  let queryString = `INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3)
    RETURNING *`;
  let values = [user.name, user.email, user.password];
  pool.query(queryString,values)
      .then(result => result.rows[0])
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  let queryString = `SELECT * FROM reservations
  WHERE guest_id = $1`;
  let values = [guest_id];
  pool.query(queryString,values)
      .then(result => console.log(result.rows[0]))

  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  let queryString = `SELECT * FROM properties LIMIT $1`;
  let values = [limit];
return pool
  .query (queryString,values)
  .then((result) => result.rows)
  .catch((err) => console.log(err.message));
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
