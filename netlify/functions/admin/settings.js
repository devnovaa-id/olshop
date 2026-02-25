const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');
      if (error) throw error;
      const settings = {};
      data.forEach(item => { settings[item.key] = item.value; });
      return {
        statusCode: 200,
        body: JSON.stringify(settings),
      };
    }

    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      const newSettings = JSON.parse(event.body);
      await supabase.from('settings').delete().neq('id', 0);
      const inserts = Object.entries(newSettings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('settings').insert(inserts);
      if (error) throw error;
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Pengaturan disimpan' }),
      };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};