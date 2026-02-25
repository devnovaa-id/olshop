const { supabase } = require('../utils/supabase');
const { generateOrderNumber } = require('../utils/generateOrderNumber');
const { sendEmail } = require('../utils/sendEmail');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      paymentProof,
      items,
      shippingCost = 0,
    } = JSON.parse(event.body);

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
      if (!product || product.stock < item.quantity) {
        return { statusCode: 400, body: JSON.stringify({ message: `Stok tidak cukup untuk produk ID ${item.product_id}` }) };
      }
    }

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + shippingCost;

    let customerId = null;
    if (customerEmail) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle();
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert([{ name: customerName, email: customerEmail, phone: customerPhone, address: shippingAddress }])
          .select()
          .single();
        customerId = newCustomer.id;
      }
    }

    const orderNumber = generateOrderNumber();
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: customerId,
        order_number: orderNumber,
        total_amount: total,
        payment_method: paymentMethod,
        payment_proof: paymentProof || null,
        shipping_address: shippingAddress,
        shipping_cost: shippingCost,
        status: 'pending',
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    for (const item of items) {
      await supabase.rpc('decrement_stock', { product_id: item.product_id, quantity: item.quantity });
    }

    try {
      const adminEmail = process.env.FROM_EMAIL;
      await sendEmail(
        adminEmail,
        `Pesanan Baru: ${orderNumber}`,
        `<p>Pesanan baru dengan nomor ${orderNumber} telah dibuat.</p><p>Total: Rp ${total}</p>`
      );
    } catch (emailErr) {
      console.error('Gagal kirim email:', emailErr);
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ orderNumber, message: 'Pesanan berhasil dibuat' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};