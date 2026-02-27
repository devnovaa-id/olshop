const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (user.role !== 'master') {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 401, body: { message: err.message } };
  }
};