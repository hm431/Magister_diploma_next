'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { getQueryClient } from '@/lib/query-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1b1f25',
            color: '#e8eaee',
            border: '1px solid #272c34',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#7fb3b0', secondary: '#0e1014' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0e1014' } },
        }}
      />
    </QueryClientProvider>
  );
}
