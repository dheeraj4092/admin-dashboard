import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestDatabase() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    connection: boolean;
    userRolesTable: boolean;
    userRolesPolicy: boolean;
    error?: string;
  }>({
    connection: false,
    userRolesTable: false,
    userRolesPolicy: false,
  });

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    setLoading(true);
    try {
      // Test 1: Check connection
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) throw new Error(`Connection error: ${authError.message}`);
      
      setResults(prev => ({ ...prev, connection: true }));
      
      // Test 2: Check if user_roles table exists
      const { error: tableError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);
        
      if (tableError) {
        if (tableError.code === '42P01') {
          // Table doesn't exist
          setResults(prev => ({ 
            ...prev, 
            userRolesTable: false,
            error: 'user_roles table does not exist. Please run the SQL script to create it.'
          }));
        } else {
          setResults(prev => ({ 
            ...prev, 
            userRolesTable: false,
            error: `Error checking user_roles table: ${tableError.message}`
          }));
        }
      } else {
        setResults(prev => ({ ...prev, userRolesTable: true }));
      }
      
      // Test 3: Check if RLS policies are working
      if (!tableError) {
        try {
          const { error: policyError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(1);
            
          if (policyError) {
            setResults(prev => ({ 
              ...prev, 
              userRolesPolicy: false,
              error: `RLS policy error: ${policyError.message}`
            }));
          } else {
            setResults(prev => ({ ...prev, userRolesPolicy: true }));
          }
        } catch (policyError) {
          setResults(prev => ({ 
            ...prev, 
            userRolesPolicy: false,
            error: `Error testing RLS policies: ${policyError instanceof Error ? policyError.message : String(policyError)}`
          }));
        }
      }
    } catch (error) {
      console.error('Database test error:', error);
      setResults(prev => ({ 
        ...prev, 
        error: `Database test error: ${error instanceof Error ? error.message : String(error)}`
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Database Test Results
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Checking database connection and configuration
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Testing database connection...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Test Results</h3>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Database Connection</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.connection ? (
                        <span className="text-green-600">✓ Connected</span>
                      ) : (
                        <span className="text-red-600">✗ Failed</span>
                      )}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">user_roles Table</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.userRolesTable ? (
                        <span className="text-green-600">✓ Exists</span>
                      ) : (
                        <span className="text-red-600">✗ Missing</span>
                      )}
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">RLS Policies</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.userRolesPolicy ? (
                        <span className="text-green-600">✓ Working</span>
                      ) : (
                        <span className="text-red-600">✗ Issue detected</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {results.error && (
                <div className="mt-5 bg-red-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{results.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-5">
                <button
                  type="button"
                  onClick={testDatabase}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Run Tests Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 