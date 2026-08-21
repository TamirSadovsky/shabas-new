const jwt = require('jsonwebtoken');

const user = { id: 'user_id', role: 'user_role' }; // This should come from your auth logic
const secret = process.env.JWT_SECRET; // Keep your secret key safe and out of version control
const token = jwt.sign(user, secret, { expiresIn: '24h' }); // Customize token expiration as needed
