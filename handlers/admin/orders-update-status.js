const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');
const { sendEmail } = require('../utils/sendEmail');

module.exports = async (event) => {
  try {
    if (event.method !== 'PUT') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { id, status, tracking_number } = event.body;
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

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};