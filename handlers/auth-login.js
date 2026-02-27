const { supabase } = require('./utils/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (event) => {
  try {
    if (event.method !== 'POST') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const { email, password } = event.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return { statusCode: 401, body: { message: 'Email tidak ditemukan' } };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { statusCode: 401, body: { message: 'Password salah' } };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      statusCode: 200,
      body: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};