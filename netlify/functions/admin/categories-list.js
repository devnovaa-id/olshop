const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ message: err.message }) };
  }
};