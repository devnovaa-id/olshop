const jwt = require('jsonwebtoken');

exports.verifyToken = (event) => {
  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, process.env.JWT_SECRET);
};