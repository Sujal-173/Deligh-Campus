'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('OAuth authentication failed. Please try again.');
        setLoading(false);
        setTimeout(() => router.push('/login?error=oauth_failed'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received.');
        setLoading(false);
        setTimeout(() => router.push('/login?error=no_code'), 3000);
        return;
      }

      try {
        const response = await fetch('/api/auth/oauth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('OAuth authentication failed');
        }

        const data = await response.json();

        if (data.success && data.data) {
          toast.success('Successfully authenticated with Google');
          router.push('/dashboard');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch {
        setError('Authentication failed. Please try again.');
        toast.error('Authentication failed');
        setTimeout(() => router.push('/login?error=auth_failed'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-10">
      <Card className="w-full max-w-md p-8">
        {loading ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Authenticating...</h2>
            <p className="mt-2 text-sm text-grey-60">
              Please wait while we complete your authentication.
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-10">
                <svg className="h-6 w-6 text-error-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-primary">Authentication Failed</h2>
            <p className="mt-2 text-sm text-grey-60">{error}</p>
            <p className="mt-4 text-xs text-grey-50">Redirecting to login page...</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-grey-10">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <h2 className="text-lg font-semibold text-primary">Loading...</h2>
          </Card>
        </div>
      }
    >
      <OAuth2CallbackContent />
    </Suspense>
  );
}