const { supabase } = require('./utils/supabase');
const bcrypt = require('bcryptjs');

module.exports = async (event) => {
  try {
    if (event.method !== 'POST') {
      return { statusCode: 405, body: { message: 'Method Not Allowed' } };
    }

    const { name, email, password, phone, address } = event.body;

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return { statusCode: 400, body: { message: 'Email sudah terdaftar' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, email, password: hashedPassword, phone, address }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 201,
      body: { message: 'Registrasi berhasil', customer: { id: data.id, name: data.name, email: data.email } }
    };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};