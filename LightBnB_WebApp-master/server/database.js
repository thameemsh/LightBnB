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
  return pool.query(queryString,values)
      .then(result => result.rows[0])
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
 const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
    `SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
    FROM reservations
    LEFT JOIN properties ON reservations.property_id = properties.id
    LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1 AND end_date < CURRENT_DATE
    GROUP BY properties.id, reservations.id
    ORDER BY start_date
    LIMIT $2;`, [guest_id, limit])
    .then((res) => res.rows)
    .catch((err) => console.error("query error", err.stack));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  const queryParams = [];

  let queryString = `SELECT properties.*, AVG(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id`;

  if(options.city) {
    queryParams.push(`%${options.city}%`)
    queryString += ` WHERE city LIKE $${queryParams.length}`
  }

  if(options.owner_id) {
    if(queryParams.length > 0 ) {
      queryString += ` AND`
    } else {
      queryString += ` WHERE`
    }
    queryParams.push(`%${options.owner_id}%`)
    queryString += ` properties.owner_id LIKE $${queryParams.length}`
  }

  if(options.minimum_price_per_night) {
    if(queryParams.length > 0 ) {
      queryString += ` AND`
    } else {
      queryString += ` WHERE`
    }
    const min = Number(options.minimum_price_per_night) * 100;
    queryParams.push(min)
    queryString += ` properties.cost_per_night >= $${queryParams.length}`
  }

  if(options.maximum_price_per_night) {
    if(queryParams.length > 0 ) {
      queryString += ` AND`
    } else {
      queryString += ` WHERE`
    }
    const max = Number(options.minimum_price_per_night) * 100;
    queryParams.push(max)
    queryString += ` properties.cost_per_night <= $${queryParams.length}`
  }

  queryString += ` GROUP BY properties.id`;
  
  
  if(options.minimum_rating) {
    queryParams.push(`%${options.minimum_rating}%`)
    queryString += ` HAVING AVG(property_reviews.rating) >= $${queryParams.length}`
  }

  queryParams.push(limit);
  queryString += ` ORDER BY cost_per_night ASC
  LIMIT $${queryParams.length};`;

  console.log(queryString, queryParams);

return pool.query (queryString,queryParams)
           .then(res => res.rows)
           .catch((err) => {
            console.log(err.message)});

}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  let queryString = `INSERT INTO properties (
    owner_id, 
    title, 
    description, 
    thumbnail_photo_url, 
    cover_photo_url, 
    cost_per_night, 
    street, 
    city, 
    province, 
    post_code, 
    country, 
    parking_spaces, 
    number_of_bathrooms, 
    number_of_bedrooms, 
    active) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`
  
  let values = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    true
  ]
  
  return pool
  .query(queryString,values)
  .then(result => result.rows[0])
}
exports.addProperty = addProperty;