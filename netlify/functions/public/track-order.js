const { supabase } = require('../utils/supabase');

exports.handler = async (event) => {
  try {
    const { orderNumber } = event.queryStringParameters || {};
    if (!orderNumber) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Nomor pesanan diperlukan' }) };
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

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};