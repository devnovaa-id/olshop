const { supabase } = require('../utils/supabase');
const { verifyToken } = require('../utils/verifyToken');

exports.handler = async (event) => {
  try {
    const user = verifyToken(event);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    // Total pesanan
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total pendapatan (semua pesanan dengan status delivered)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');
    const totalRevenue = revenueData.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);

    // Produk terjual (jumlah item dari order delivered)
    const { data: soldData } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(status)')
      .eq('orders.status', 'delivered');
    const totalSold = soldData.reduce((acc, item) => acc + item.quantity, 0);

    // Pesanan per status untuk chart
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('status, count');
    // Alternatif: hitung manual
    const statusMap = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    statusCounts.forEach(item => {
      statusMap[item.status] = parseInt(item.count);
    });

    // Pesanan per hari (7 hari terakhir) untuk chart line
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: ordersPerDay } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at');

    const dailyData = {};
    ordersPerDay.forEach(order => {
      const date = order.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, revenue: 0 };
      }
      dailyData[date].count += 1;
      dailyData[date].revenue += parseFloat(order.total_amount);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalOrders,
        totalRevenue,
        totalSold,
        statusCounts: statusMap,
        dailyData
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};