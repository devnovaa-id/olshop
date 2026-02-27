const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    if (event.method !== 'POST') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { name, description } = event.body;
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;

    return { statusCode: 201, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};