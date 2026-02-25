const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (user.role !== 'master') {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    if (event.httpMethod !== 'DELETE') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'ID diperlukan' }) };
    }

    if (parseInt(id) === user.id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Tidak dapat menghapus akun sendiri' }) };
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User dihapus' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};