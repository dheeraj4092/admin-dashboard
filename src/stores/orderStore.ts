import { create } from 'zustand';
import { orders } from '../lib/db';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes?: string;
}

export interface Order {
  id?: string;
  user_id?: string;
  items: OrderItem[];
  shipping_details: ShippingDetails;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  getAdminOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Tables['orders']['Row']['status']) => Promise<Tables['orders']['Row']>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  getAdminOrders: async () => {
    try {
      set({ loading: true, error: null });
      
      const ordersData = await orders.getAll();
      
      // Transform the data to match our Order interface
      const transformedOrders: Order[] = ordersData.map((order: any) => {
        // Extract items from order_items if available
        const items = order.order_items?.map((item: any) => ({
          id: item.product_id,
          title: item.products?.title || 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
          image_url: item.products?.image_url || '',
        })) || [];
        
        return {
          id: order.id,
          user_id: order.user_id,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items,
          shipping_details: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
          },
        };
      });
      
      // Fetch shipping details for each order
      const ordersWithDetails = await Promise.all(
        transformedOrders.map(async (order) => {
          if (!order.id) return order;
          
          try {
            // Get shipping details
            const { data: shippingDetails, error: shippingError } = await supabase
              .from('shipping_details')
              .select('*')
              .eq('order_id', order.id)
              .single();
            
            if (shippingError) {
              console.error('Error fetching shipping details:', shippingError);
            }
            
            return {
              ...order,
              shipping_details: shippingDetails ? {
                firstName: shippingDetails.first_name || '',
                lastName: shippingDetails.last_name || '',
                email: shippingDetails.email || '',
                phone: shippingDetails.phone || '',
                address: shippingDetails.address || '',
                city: shippingDetails.city || '',
                state: shippingDetails.state || '',
                zipCode: shippingDetails.zip_code || '',
                country: shippingDetails.country || '',
                notes: shippingDetails.notes || '',
              } : {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
              },
            };
          } catch (error) {
            console.error('Error fetching order details:', error);
            return order;
          }
        })
      );
      
      set({ orders: ordersWithDetails });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId: string, status: Tables['orders']['Row']['status']) => {
    try {
      set({ loading: true, error: null });
      
      console.log(`Calling orders.updateStatus with id=${orderId}, status=${status}`);
      const updatedOrder = await orders.updateStatus(orderId, status);
      console.log('Update result:', updatedOrder);
      
      if (!updatedOrder) {
        throw new Error(`Failed to update order with ID ${orderId}`);
      }
      
      // Update local state with the updated order data
      set((state: OrderState) => ({
        orders: state.orders.map((order: Order) => 
          order.id === orderId 
            ? { 
                ...order, 
                status: updatedOrder.status, 
                updated_at: updatedOrder.updated_at 
              } 
            : order
        ),
      }));
      
      return updatedOrder;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      let errorMessage = 'Failed to update order status';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error object
        const supabaseError = error as { message?: string; details?: string; code?: string };
        errorMessage = supabaseError.message || supabaseError.details || errorMessage;
        
        // Add more context for specific error codes
        if (supabaseError.code === 'PGRST116') {
          errorMessage = 'Order not found or could not be updated';
        }
      }
      
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
})); 