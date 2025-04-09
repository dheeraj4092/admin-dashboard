import { useEffect } from 'react';
import { useOrderStore, Order } from '../stores/orderStore';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AdminOrders = () => {
  const { orders, loading, error, getAdminOrders, updateOrderStatus } = useOrderStore();

  useEffect(() => {
    getAdminOrders();
  }, [getAdminOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      await updateOrderStatus(orderId, newStatus as Order['status']);
      console.log('Order updated successfully');
      toast.success(`Order status updated to ${newStatus}`);
      
      // Refresh the orders list to ensure we have the latest data
      await getAdminOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      let errorMessage = 'Failed to update order status';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const supabaseError = error as { message?: string; details?: string };
        errorMessage = supabaseError.message || supabaseError.details || errorMessage;
      }
      
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order: Order) => (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id?.slice(-8)}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.created_at && format(new Date(order.created_at), 'PPP p')}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id!, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p>{order.shipping_details.firstName} {order.shipping_details.lastName}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_details.email}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_details.phone}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p>{order.shipping_details.address}</p>
                <p>
                  {order.shipping_details.city}, {order.shipping_details.state} {order.shipping_details.zipCode}
                </p>
                <p>{order.shipping_details.country}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders; 