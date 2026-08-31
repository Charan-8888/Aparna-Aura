import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import Loader from '../components/Loader/Loader';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import Pagination from '../components/Pagination/Pagination';
import orderService from '../services/orderService';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (pageNum, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await orderService.getOrders(pageNum);
      // Determine if paginated or simple array
      const data = response.data || response;
      if (data.results) {
        setOrders(data.results);
        const count = data.count || 0;
        setTotalPages(Math.ceil(count / 10)); // Assuming 10 per page backend default
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(1);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  if (loading) return <Loader fullScreen />;

  if (error && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState message={error} onRetry={() => fetchOrders(page)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      <div className="aura-route-hero aura-route-hero--compact flex items-center justify-between mb-8">
        <SectionTitle title="Order History" />
        <button 
          onClick={() => fetchOrders(page, true)}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-[#382135] bg-gray-50 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          title="Refresh orders"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="Looks like you haven't made your first purchase yet."
          action={
            <Link to="/products" className="inline-flex bg-[#382135] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#2a1827] transition-colors mt-4">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = order.status?.toLowerCase() || 'pending';
            const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
            const itemCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
            const firstItem = order.items?.[0];
            const hasMoreItems = (order.items?.length || 0) > 1;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Order Placed</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Total</p>
                      <p className="text-sm font-bold text-[#382135]">{formatPrice(order.total_amount)}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Order #</p>
                      <p className="text-sm font-medium text-gray-900">{order.order_number || order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${colorClass}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {firstItem && (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img 
                          src={typeof firstItem.product?.images?.[0] === 'object' ? firstItem.product?.images?.[0]?.image : (firstItem.product?.images?.[0] || firstItem.product?.image || 'https://images.unsplash.com/photo-1515562141589-67f0d6ce4819?w=400&h=400&fit=crop')} 
                          alt={firstItem.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-[#382135] line-clamp-1">
                        {firstItem?.product?.name || 'Item'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {hasMoreItems ? `+ ${itemCount - 1} more items` : `Qty: ${firstItem?.quantity || 1}`}
                      </p>
                      {!order.is_paid && status !== 'cancelled' && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle size={12} /> Payment pending
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:text-[#382135] transition-colors bg-[#D4AF37]/5 px-4 py-2 rounded-full"
                    >
                      View Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default Orders;
