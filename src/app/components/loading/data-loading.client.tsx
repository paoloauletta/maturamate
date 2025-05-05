"use client";

import { LoadingSpinner } from "./loading-spinner";

interface DataLoadingProps<T> {
  data: T | null | undefined;
  isLoading: boolean;
  error?: Error | null;
  loadingText?: string;
  errorText?: string;
  children: (data: T) => React.ReactNode;
}

/**
 * Client component for handling data loading states
 * Use this in .client.tsx components when fetching data
 */
export function DataLoading<T>({
  data,
  isLoading,
  error,
  loadingText = "Caricamento dati...",
  errorText = "Si è verificato un errore durante il caricamento dei dati.",
  children,
}: DataLoadingProps<T>) {
  if (isLoading) {
    return <LoadingSpinner text={loadingText} />;
  }

  if (error) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-red-500 font-medium">{errorText}</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-muted-foreground">Nessun dato disponibile.</p>
      </div>
    );
  }

  return <>{children(data)}</>;
}
