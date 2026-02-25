const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    if (event.httpMethod !== 'DELETE') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID diperlukan' }) };
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Produk dihapus' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};