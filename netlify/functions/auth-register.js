const { supabase } = require('./utils/supabase');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { name, email, password, phone, address } = JSON.parse(event.body);

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Email sudah terdaftar' }) };
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
      body: JSON.stringify({ message: 'Registrasi berhasil', customer: { id: data.id, name: data.name, email: data.email } }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};