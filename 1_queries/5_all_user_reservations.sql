SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
FROM reservations
LEFT JOIN properties ON reservations.property_id = properties.id
LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1 AND end_date <= CURRENT_DATE
GROUP BY properties.id, reservations.id
ORDER BY start_date
LIMIT 10;
