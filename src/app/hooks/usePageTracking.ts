'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackDevice } from '@/app/lib/deviceAnalytics';

export const usePageTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const cleanPath = pathname.split('?')[0];
      trackDevice(cleanPath);
    }
  }, [pathname]);
};