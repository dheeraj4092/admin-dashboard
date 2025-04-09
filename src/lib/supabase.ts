import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client with the anonymous key for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase admin client with the service role key for admin operations
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to the regular client if service key is not available

// Product types
export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

// User types
export interface User {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

// Order types
export interface Order {
  id?: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at?: string;
  updated_at?: string;
}

// Order item types
export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at?: string;
}

// Database operations
export const db = {
  // Product operations
  products: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    
    create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    
    update: async (id: string, product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Product;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  },
  
  // User operations
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as User;
    },
    
    create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    },
    
    update: async (id: string, user: Partial<User>) => {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  },
  
  // Order operations
  orders: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users:user_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Order & { users: { first_name: string; last_name: string; email: string } })[];
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users:user_id (first_name, last_name, email)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Order & { users: { first_name: string; last_name: string; email: string } };
    },
    
    getOrderItems: async (orderId: string) => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products:product_id (title, image_url)
        `)
        .eq('order_id', orderId);
      
      if (error) throw error;
      return data as (OrderItem & { products: { title: string; image_url: string } })[];
    },
    
    updateStatus: async (id: string, status: Order['status']) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Order;
    }
  }
}; 