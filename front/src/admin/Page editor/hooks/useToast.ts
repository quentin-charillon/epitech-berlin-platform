import { useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  return { toast, showToast };
}
