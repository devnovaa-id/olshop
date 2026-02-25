const { supabase } = require('../utils/supabase');

exports.handler = async (event) => {
  try {
    const { slug } = event.queryStringParameters || {};
    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Slug diperlukan' }) };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
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