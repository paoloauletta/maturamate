/**
 * Client API Utilities
 *
 * Centralized API fetching functions for client components.
 * This provides a consistent approach to data fetching,
 * error handling, and loading states in client components.
 */

"use client";

import { useState, useEffect } from "react";

interface ApiResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Basic fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for fetching data with automatic loading and error handling
 */
export function useApiData<T>(
  url: string,
  options?: RequestInit
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const result = await apiFetch<T>(url, options);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);

  return { data, isLoading, error };
}

/**
 * Function to make POST requests with proper error handling
 */
export async function apiPost<T, D = any>(url: string, data: D): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Function for data mutations with automatic error handling
 */
export function useMutation<T, D = any>(url: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (mutationData: D) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiPost<T, D>(url, mutationData);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
}
