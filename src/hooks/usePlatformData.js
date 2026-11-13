import { useContext } from 'react';
import { PlatformDataContext } from '../context/PlatformDataContext';

export function usePlatformData() {
  const ctx = useContext(PlatformDataContext);
  if (!ctx) {
    throw new Error('usePlatformData must be used within a PlatformDataProvider');
  }
  return ctx;
}
