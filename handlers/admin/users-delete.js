const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    if (event.method !== 'DELETE') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const user = verifyToken(event.headers);
    if (user.role !== 'master') {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { id } = event.queryStringParameters || {};
    if (!id) {
      return { statusCode: 400, body: { message: 'ID diperlukan' } };
    }

    if (parseInt(id) === user.id) {
      return { statusCode: 400, body: { message: 'Tidak dapat menghapus akun sendiri' } };
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    return { statusCode: 200, body: { message: 'User dihapus' } };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};