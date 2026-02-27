const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, body: { message: 'ID diperlukan' } };
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

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};