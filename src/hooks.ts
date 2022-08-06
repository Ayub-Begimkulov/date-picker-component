import { useRef, useLayoutEffect } from 'react';

export function useLatest<T>(value: T) {
  const valueRef = useRef(value);

  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef;
}
