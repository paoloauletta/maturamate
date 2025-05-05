import { Suspense } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface PageLoadingProps {
  children: React.ReactNode;
  loadingText?: string;
}

/**
 * Server component wrapper for handling loading states with Suspense
 * Use this in page.tsx server components
 */
export function PageLoading({
  children,
  loadingText = "Caricamento...",
}: PageLoadingProps) {
  return (
    <Suspense fallback={<LoadingSpinner text={loadingText} />}>
      {children}
    </Suspense>
  );
}
