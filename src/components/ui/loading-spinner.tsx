import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  text = "Caricamento...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary mb-4`}
      />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
