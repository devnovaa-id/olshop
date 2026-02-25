const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID diperlukan' }) };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(*),
        order_items(
          quantity,
          price,
          products(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};