import { useEffect, useRef } from 'react';

export const APP_NAME = 'How Long';
export const API_BASE_URI = process.env.REACT_APP_LAMBDA_ENDPOINT;

export function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = state;
  });
  return ref.current;
}
