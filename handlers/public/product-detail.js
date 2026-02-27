const { supabase } = require('../utils/supabase');

module.exports = async (event) => {
  try {
    const { slug } = event.queryStringParameters || {};
    if (!slug) {
      return { statusCode: 400, body: { message: 'Slug diperlukan' } };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
      .single();

    if (error) throw error;

    return { statusCode: 200, body: data };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};