const { supabase } = require('../utils/supabase');
const { verifyToken, ensureUserExists } = require('../utils/verifyToken');

module.exports = async (event) => {
  try {
    const user = verifyToken(event.headers);
    if (!['admin', 'master'].includes(user.role)) {
      return { statusCode: 403, body: { message: 'Forbidden' } };
    }

    await ensureUserExists(user.id);

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');
    const totalRevenue = revenueData?.reduce((acc, order) => acc + parseFloat(order.total_amount), 0) || 0;

    const { data: soldData } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(status)')
      .eq('orders.status', 'delivered');
    const totalSold = soldData?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    const { data: allOrders } = await supabase.from('orders').select('status');
    const statusMap = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    if (allOrders) {
      allOrders.forEach(order => {
        if (statusMap.hasOwnProperty(order.status)) {
          statusMap[order.status] += 1;
        }
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: ordersPerDay } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at');

    const dailyData = {};
    if (ordersPerDay) {
      ordersPerDay.forEach(order => {
        const date = order.created_at.split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { count: 0, revenue: 0 };
        }
        dailyData[date].count += 1;
        dailyData[date].revenue += parseFloat(order.total_amount);
      });
    }

    return {
      statusCode: 200,
      body: {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalSold,
        statusCounts: statusMap,
        dailyData
      }
    };
  } catch (err) {
    return { statusCode: 500, body: { message: err.message } };
  }
};