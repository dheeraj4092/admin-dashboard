// This is a simple script to test your Supabase connection
// Run this with Node.js to verify your credentials

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');
    
    // Try to get the current user session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Connection failed:', error.message);
    } else {
      console.log('Connection successful!');
      console.log('Session data:', data);
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

testConnection(); 