import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Simple framework ready hook - no complex initialization needed
    console.log('Framework ready');
  }, []);
}