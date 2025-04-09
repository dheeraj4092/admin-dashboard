import { useState, useEffect } from 'react';

export default function TestEnv() {
  const [envLoaded, setEnvLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Environment variables are missing');
      } else {
        setEnvLoaded(true);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Environment Variables Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {envLoaded ? 'Environment variables loaded successfully' : 'Checking environment variables...'}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500">URL: {import.meta.env.VITE_SUPABASE_URL || 'Not loaded'}</p>
            <p className="text-xs text-gray-500">Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'Not loaded'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 