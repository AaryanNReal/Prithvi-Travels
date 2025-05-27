'use client';

import { usePageTracking } from '@/app/hooks/usePageTracking';

export default function TrackingWrapper({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}