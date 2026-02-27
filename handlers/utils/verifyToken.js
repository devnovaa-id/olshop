const jwt = require('jsonwebtoken');
const { supabase } = require('./supabase');

exports.verifyToken = (headers) => {
  const authHeader = headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) throw new Error('Missing token');
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.ensureUserExists = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error('User tidak ditemukan atau telah dihapus');
  }
  return true;
};