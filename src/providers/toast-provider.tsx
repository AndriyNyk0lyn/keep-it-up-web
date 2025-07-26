import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/lib/toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  useEffect(() => {
    void toast;
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        closeButton
        richColors
        expand
        visibleToasts={5}
      />
    </>
  );
}
