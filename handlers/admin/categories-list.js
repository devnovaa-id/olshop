const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 401, body: { message: err.message } };
  }
};