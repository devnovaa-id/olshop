const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (user.role !== 'master') {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { name, email, password, role } = JSON.parse(event.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    return {
      statusCode: 201,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};