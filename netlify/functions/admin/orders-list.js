const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    const { page = 1, limit = 10, status, payment_method } = event.queryStringParameters || {};
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, customers(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (payment_method) {
      query = query.eq('payment_method', payment_method);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ data, total: count, page, limit }),
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ message: err.message }) };
  }
};