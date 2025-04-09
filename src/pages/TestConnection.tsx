import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to get the current user session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(`Error: ${error.message}`);
          setStatus('Connection failed');
        } else {
          setStatus('Connection successful!');
          console.log('Supabase connection successful', data);
        }
      } catch (err) {
        setError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('Connection failed');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Supabase Connection Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {status}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500">URL: {supabaseUrl}</p>
            <p className="text-xs text-gray-500">Key: {supabaseAnonKey.substring(0, 10)}...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 