const { supabase } = require('../utils/supabase');

module.exports = async (event) => {
  try {
    const { page = 1, limit = 12, category, search } = event.queryStringParameters || {};
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .gt('stock', 0);

    if (category) {
      query = query.eq('category_id', category);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return {
      statusCode: 200,
      body: { data, total: count, page: parseInt(page), limit: parseInt(limit) }
    };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};