const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');
const { sendEmail } = require('../utils/sendEmail');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    if (event.httpMethod !== 'PUT') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { id, status, tracking_number } = JSON.parse(event.body);

    const updates = { status };
    if (tracking_number) updates.tracking_number = tracking_number;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, customers(email)')
      .single();

    if (error) throw error;

    if (data.customers && data.customers.email) {
      try {
        await sendEmail(
          data.customers.email,
          `Status Pesanan ${data.order_number} diperbarui`,
          `<p>Status pesanan Anda sekarang: <strong>${status}</strong></p>`
        );
      } catch (emailErr) {
        console.error('Gagal kirim email ke customer:', emailErr);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};