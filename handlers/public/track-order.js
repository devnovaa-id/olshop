const { supabase } = require('../utils/supabase');

module.exports = async (event) => {
  try {
    const { orderNumber } = event.queryStringParameters || {};
    if (!orderNumber) {
      return { statusCode: 400, body: { message: 'Nomor pesanan diperlukan' } };
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          quantity,
          price,
          products(name)
        )
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};