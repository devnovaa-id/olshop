const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { page = 1, limit = 10, search } = event.queryStringParameters || {};
    const offset = (page - 1) * limit;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      body: { data, total: count, page: parseInt(page), limit: parseInt(limit) }
    };
  } catch (err) {
    return { statusCode: 401, body: { message: err.message } };
  }
};