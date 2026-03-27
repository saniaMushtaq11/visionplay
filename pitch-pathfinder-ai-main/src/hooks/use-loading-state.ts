import { useState } from 'react';

/**
 * A custom hook for managing loading states with async operations
 * 
 * @param initialState - Initial loading state (default: false)
 * @returns An object containing loading state and utility functions
 */
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  /**
   * Executes an async function with loading state management
   * 
   * @param asyncFn - The async function to execute
   * @param onSuccess - Optional callback for successful execution
   * @param onError - Optional callback for error handling
   */
  const executeWithLoading = async (
    asyncFn: () => Promise<any>,
    onSuccess?: (result: any) => void,
    onError?: (error: any) => void
  ) => {
    setIsLoading(true);
    try {
      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    setIsLoading,
    executeWithLoading,
  };
}