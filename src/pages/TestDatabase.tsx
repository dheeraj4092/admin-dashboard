import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TestDatabase() {
  const [status, setStatus] = useState<{
    connection: boolean;
    error?: string;
  }>({
    connection: false
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Check basic connection
      const { error: authError } = await supabase.auth.getSession();
      if (authError) throw new Error(`Connection error: ${authError.message}`);
      setStatus(prev => ({ ...prev, connection: true }));
    } catch (err) {
      setStatus(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : String(err)
      }));
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

        {status.connection ? (
          <div className="text-center">
            <p className="text-gray-600">Database connection is established.</p>
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
                      {status.connection ? (
                        <span className="text-green-600">✓ Connected</span>
                      ) : (
                        <span className="text-red-600">✗ Failed</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {status.error && (
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
                        <p>{status.error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-5">
                <button
                  type="button"
                  onClick={testConnection}
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