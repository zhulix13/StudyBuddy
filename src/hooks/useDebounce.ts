// hooks/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * A custom hook that debounces a value
 * Useful for delaying expensive operations like API calls
 * 
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * // Use debouncedSearchTerm to trigger API calls
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup the timer if the value changes before the delay finishes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}