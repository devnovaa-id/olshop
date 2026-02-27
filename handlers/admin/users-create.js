const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');
const bcrypt = require('bcryptjs');

module.exports = async (event) => {
  try {
    if (event.method !== 'POST') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const user = verifyToken(event.headers);
    if (user.role !== 'master') {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { name, email, password, role } = event.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    return { statusCode: 201, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};