"use client";

interface LoadingSpinnerProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

export function LoadingSpinner({
  text = "Caricamento...",
  size = "medium",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div
        className={`${sizeClasses[size]} border-t-primary border-primary/30 rounded-full animate-spin`}
      />
      {text && <p className="text-muted-foreground mt-4">{text}</p>}
    </div>
  );
}
