import { supabase, supabaseAdmin } from './supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];

// Product operations
export const products = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Tables['products']['Row'][];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Tables['products']['Row'];
  },
  
  create: async (product: Tables['products']['Insert']) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables['products']['Row'];
  },
  
  update: async (id: string, product: Tables['products']['Update']) => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables['products']['Row'];
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Order operations
export const orders = {
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (*),
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (Tables['orders']['Row'] & {
      users: Tables['users']['Row'];
      order_items: (Tables['order_items']['Row'] & {
        products: Tables['products']['Row']
      })[];
    })[];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (*),
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Tables['orders']['Row'] & {
      users: Tables['users']['Row'];
      order_items: (Tables['order_items']['Row'] & {
        products: Tables['products']['Row']
      })[];
    };
  },
  
  updateStatus: async (id: string, status: Tables['orders']['Row']['status']) => {
    console.log(`Updating order ${id} status to ${status}`);
    
    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    // First check if the order exists
    const { data: existingOrder, error: checkError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking if order exists:', checkError);
      throw checkError;
    }
    
    if (!existingOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    console.log('Existing order found:', existingOrder);
    
    // Update the order status with admin credentials
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating order status:', updateError);
      throw updateError;
    }
    
    // Return the updated order data
    return {
      ...existingOrder,
      status,
      updated_at: new Date().toISOString()
    } as Tables['orders']['Row'];
  }
};

// User operations
export const users = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as (Tables['users']['Row'] & {
      user_roles: Tables['user_roles']['Row'][];
    })[];
  },
  
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Tables['users']['Row'] & {
      user_roles: Tables['user_roles']['Row'][];
    };
  },
  
  update: async (id: string, user: Tables['users']['Update']) => {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables['users']['Row'];
  },
  
  updateRole: async (userId: string, role: Tables['user_roles']['Row']['role']) => {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert([{ user_id: userId, role }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables['user_roles']['Row'];
  }
};

// Auth operations
export const auth = {
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}; 