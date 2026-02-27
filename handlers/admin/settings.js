const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    if (event.method === 'GET') {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');
      if (error) throw error;
      const settings = {};
      data.forEach(item => { settings[item.key] = item.value; });
      return { statusCode: 200, body: settings };
    }

    if (event.method === 'POST' || event.method === 'PUT') {
      const newSettings = event.body;
      await supabase.from('settings').delete().neq('id', 0);
      const inserts = Object.entries(newSettings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('settings').insert(inserts);
      if (error) throw error;
      return { statusCode: 200, body: { message: 'Pengaturan disimpan' } };
    }

    return { statusCode: 405, body: { message: 'Method Not Allowed' } };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};